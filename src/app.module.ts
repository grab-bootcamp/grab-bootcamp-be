import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SseModule } from './sse/sse.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FwiModule } from './fwi/fwi.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        MONGO_URI: Joi.string().required(),
      }),
    }),
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
    FwiModule,
  ],
})
export class AppModule { }
