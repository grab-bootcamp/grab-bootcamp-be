import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import * as SendGrid from '@sendgrid/mail';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateSubscriberDto, SendEmailVariablesDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) { }

  @OnEvent('mail.fanout')
  async fanoutEmail(payload: SendEmailVariablesDto) {
    const doSendEmail = async (cursor: number) => {
      const subscribers = await this.mailService.getSubscribers(cursor);

      // Check if there are no subscribers left
      if (subscribers.length === 0) { return null }

      const emailPayload: SendGrid.MailDataRequired[] = subscribers.map((subscriber) => ({
        templateId: this.configService.get('SENDGRID_NOTIFICATION_TEMPLATE_ID'),
        from: {
          name: 'The Forest Fire System',
          email: this.configService.get('SENDGRID_NOTIFICATION_SENDER')
        },
        to: subscriber.mEmail,
        subject: payload.title,
        headers: {
          "X-Priority": "1",
          "Priority": "Urgent",
          "Importance": "high"
        },
        dynamicTemplateData: {
          ...payload,
          unsubscribeUrl: `${this.configService.get('APP_URL')}/unsubscribe/${subscriber.mDisposeToken}`,
        },
      }));
      await this.mailService.sendEmail(emailPayload);

      return subscribers[subscribers.length - 1].mId;
    };

    let cursor = null;

    do {
      cursor = await doSendEmail(cursor);
    } while (cursor);
  }

  @Post('/subscriber')
  addSubscriber(@Body() payload: CreateSubscriberDto) {
    this.mailService.addSubscriber(payload.email);
  }

  @Delete('/subscriber/:disposeToken')
  removeSubscriber(@Param() disposeToken: string) {
    this.mailService.removeSubscriber(disposeToken);
  }
}
