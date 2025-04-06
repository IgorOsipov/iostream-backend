import type { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig: (
  configService: ConfigService
) => MailerOptions = (configService) => {
  return {
    transport: {
      host: configService.getOrThrow<string>('MAIL_HOST'),
      port: configService.getOrThrow<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: configService.getOrThrow<string>('MAIL_LOGIN'),
        pass: configService.getOrThrow<string>('MAIL_PASSWORD')
      }
    },
    defaults: {
      from: `"IoStream" ${configService.getOrThrow<string>('MAIL_LOGIN')}`
    }
  };
};
