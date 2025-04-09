import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { MailService } from '../libs/mail/mail.service';
import { StorageService } from '../libs/storage/storage.service';

@Injectable()
export class CronService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly storageService: StorageService
  ) {}

  @Cron('0 0 * * *')
  public async deleteDeactivatedAccounts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deactivatedAccounts = await this.prismaService.user.findMany({
      where: {
        isDeactivated: true,
        deactivatedAt: {
          lte: sevenDaysAgo
        }
      }
    });

    for (const account of deactivatedAccounts) {
      await this.mailService.sendAccountDeletion(account.email);
      if (account.avatar) {
        await this.storageService.remove(account.avatar);
      }
    }

    await this.prismaService.user.deleteMany({
      where: {
        id: {
          in: deactivatedAccounts.map(account => account.id)
        }
      }
    });
  }
}
