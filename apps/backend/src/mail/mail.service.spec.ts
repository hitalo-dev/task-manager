import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '12345' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              if (key === 'SMTP_HOST') return 'smtp.example.com';
              if (key === 'SMTP_PORT') return 587;
              if (key === 'SMTP_SECURE') return 'false';
              if (key === 'SMTP_USER') return 'user';
              if (key === 'SMTP_PASS') return 'pass';
              if (key === 'SMTP_FROM') return 'noreply@example.com';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email successfully', async () => {
    const dto = {
      to: ['test@example.com'],
      subject: 'Test Subject',
      text: 'Test message',
      html: '<p>Test message</p>',
    };

    await expect(service.sendMail(dto)).resolves.not.toThrow();
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test message',
      html: '<p>Test message</p>',
    });
  });
});
