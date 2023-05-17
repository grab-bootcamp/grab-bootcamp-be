import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    SendGrid.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(mail: SendGrid.MailDataRequired[]) {
    return SendGrid.send(mail, true);
  }

  async getSubscribers(cursor: number | null, size: number = 100) {
    const onCursorArgs = {}

    if (cursor) {
      onCursorArgs['cursor'] = {
        mId: cursor,
      };
      onCursorArgs['skip'] = 1;
    }

    return this.prisma.subscriber.findMany({
      ...onCursorArgs,
      take: size,
      select: {
        mId: true,
        mEmail: true,
        mDisposeToken: true,
      }
    });
  }

  async addSubscriber(email: string) {
    this.prisma.subscriber.create({
      data: {
        mEmail: email,
        mDisposeToken: this.generateDisposeToken(),
      },
    }).catch((err) => {
      console.error(err);
    });
  }

  async removeSubscriber(disposeToken: string) {
    return this.prisma.subscriber.delete({
      where: {
        mDisposeToken: disposeToken,
      },
    });
  }

  private generateDisposeToken() {
    return crypto.randomBytes(16).toString('hex');
  }
}
