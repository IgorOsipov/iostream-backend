import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import type { Request } from 'express';
import { SessionData } from 'express-session';
import { TOTP } from 'otpauth';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';

import { VerificationService } from '../verification/verification.service';

import { LoginInput } from './inputs/login.input';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly verificationService: VerificationService
  ) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const keys = await this.redisService.keys('*');
    const userSessions: Array<SessionData & { id: string }> = [];
    for (const key of keys) {
      const sessionData = await this.redisService.get(key);
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);

        if (session.userId === userId) {
          userSessions.push({ ...session, id: key.split(':')[1] });
        }
      }
    }

    // @ts-ignore
    userSessions.sort((a, b) => b.createdAt - a.createdAt);

    return userSessions.filter((session) => session.id !== req.session.id);
  }

  public async findCurrent(req: Request) {
    const sessionId = req.session.id;
    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
    );
    if (!sessionData) {
      throw new NotFoundException('Session not found');
    }

    const session: SessionData = JSON.parse(sessionData);

    return { ...session, id: sessionId };
  }

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password, pin } = input;

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: { equals: login } }, { email: { equals: login } }]
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await verify(user.password, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isEmailVerified) {
      await this.verificationService.sendVerificationToken(user);
      throw new BadRequestException(
        'Email not verified. Please check your email for verification.'
      );
    }

    if (user.isTotpEnabled) {
      if (!pin) {
        return { message: 'TOTP is enabled. Please provide a TOTP code.' };
      }

      const totp = new TOTP({
        issuer: 'IoStream',
        label: `${user.email}`,
        algorithm: 'SHA1',
        digits: 6,
        secret: user.totpSecret ? user.totpSecret.toString() : undefined
      });

      const delta = totp.validate({ token: pin });

      if (delta === null) {
        throw new BadRequestException('Invalid TOTP code');
      }
    }

    const metadata = getSessionMetadata(req, userAgent);

    return saveSession(req, user, metadata);
  }

  public async logout(req: Request) {
    return destroySession(req, this.configService);
  }

  public async clearSessions(req: Request) {
    req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
    return true;
  }

  public async remove(req: Request, id: string) {
    if (!req.session.userId) {
      throw new UnauthorizedException('User not found');
    }

    if (req.session.id === id) {
      throw new ConflictException('Cannot remove current session');
    }

    await this.redisService.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
    );
    return true;
  }
}
