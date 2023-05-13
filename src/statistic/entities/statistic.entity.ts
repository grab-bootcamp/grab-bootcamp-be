import { Field, Float, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";
import { Prisma, Statistic as PrismaStatistic } from "@prisma/client";
import GraphQLJSON from "graphql-type-json";

export const INTERVAL_HOUR_SCRAPING = 6;
export type FwiForsestData = {
  Fo: number;
  Do: number;
  Po: number;
}
@ObjectType()
export class Statistic implements PrismaStatistic {
  @Field(() => ID)
  mId: number;

  @Field(() => GraphQLISODateTime)
  mCreatedAt: Date;

  @Field(() => Float)
  mFFMC: number;

  @Field(() => Float)
  mDMC: number;

  @Field(() => Float)
  mDC: number;

  @Field(() => Float)
  mISI: number;

  @Field(() => Float)
  mHumidity: number;

  @Field(() => Float)
  mTemperature: number;

  @Field(() => Float)
  mWindSpeed: number;

  @Field(() => Float)
  mRainfall: number;

  @Field(() => Int)
  mForestId: number;

  @Field(() => GraphQLJSON)
  mCondition: Prisma.JsonValue;

  mRawData: Prisma.JsonValue;
  pCreatedAt: string;
}