import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(sendMailDto: SendMailDto): Promise<void> {
    const { to, subject, text, html } = sendMailDto;
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@example.com');

    try {
      const info = await this.transporter.sendMail({
        from,
        to: to.join(', '),
        subject,
        text,
        html,
      });

      this.logger.log(`Email successfully sent to: ${to.join(', ')}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to: ${to.join(', ')}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}
