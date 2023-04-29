import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SseModule } from './sse/sse.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FwiModule } from './fwi/fwi.module';
import { PrismaModule } from './prisma/prisma.module';
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
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    CacheModule.register({
      ttl: 60000, // 1 minute
      isGlobal: true,
    }),
    SseModule,
    FwiModule,
    PrismaModule,
  ],
})
export class AppModule { }
