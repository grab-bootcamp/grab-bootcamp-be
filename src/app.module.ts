import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SseModule } from './sse/sse.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as Joi from 'joi';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        MONGO_URI: Joi.string().required(),
      }),
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI')
      }),
    }),
    CacheModule.register({
      ttl: 60000, // 1 minute
      isGlobal: true,
    }),
    SseModule,
  ],
})
export class AppModule { }
