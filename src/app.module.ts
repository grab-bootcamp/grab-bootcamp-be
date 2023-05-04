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
import GraphQLJSON from 'graphql-type-json';
import { ScheduleModule } from '@nestjs/schedule';
import { LivedataModule } from './livedata/livedata/livedata.module';
import { DbModule } from './livedata/db/db.module';

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
        // MONGO_URI: Joi.string().required(),
      }),
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get('MONGO_URI')
    //   }),
    // }),
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
    SseModule,
    FwiModule,
    PrismaModule,
    ForestModule,
    LivedataModule,
    DbModule,
    ScheduleModule.forRoot()
  ],
})
export class AppModule { }
