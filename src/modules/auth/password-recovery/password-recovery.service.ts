import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { hash } from 'argon2';
import { type Request } from 'express';

import { TokenType } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';

import { MailService } from '../../libs/mail/mail.service';

import { NewPasswordInput } from './inputs/new-password.input';
import { ResetPasswordInput } from './inputs/reset-password.input';

@Injectable()
export class PasswordRecoveryService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService
  ) {}

  public async resetPassword(
    req: Request,
    input: ResetPasswordInput,
    userAgent: string
  ) {
    const { email } = input;

    const user = await this.prismaService.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { token } = await generateToken(
      this.prismaService,
      user,
      TokenType.PASSWORD_RESET
    );

    const metadata = getSessionMetadata(req, userAgent);
    await this.mailService.sendPasswordRecoveryToken(email, token, metadata);

    return true;
  }

  public async newPassword(input: NewPasswordInput) {
    const { password, token } = input;

    const existingToken = await this.prismaService.token.findUnique({
      where: {
        token,
        type: TokenType.PASSWORD_RESET
      }
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();
    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }

    const user = await this.prismaService.user.update({
      where: {
        id: existingToken.userId!
      },
      data: {
        password: await hash(password)
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
        type: TokenType.PASSWORD_RESET
      }
    });

    return true;
  }
}
