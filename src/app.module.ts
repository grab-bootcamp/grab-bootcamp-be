import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SseModule } from './sse/sse.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FwiModule } from './fwi/fwi.module';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ForestModule } from './forest/forest.module';
import { NotificationModule } from './notification/notification.module';
import GraphQLJSON from 'graphql-type-json';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { StatisticModule } from './statistic/statistic.module';
import { CrawlerModule } from './crawler/crawler.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    CacheModule.register({
      ttl: 60000, // 1 minute
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      resolvers: {
        JSON: GraphQLJSON
      },
    }),
    EventEmitterModule.forRoot(),
    SseModule,
    FwiModule,
    PrismaModule,
    ForestModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    StatisticModule,
    CrawlerModule,
    MailModule
  ],
})
export class AppModule { }
