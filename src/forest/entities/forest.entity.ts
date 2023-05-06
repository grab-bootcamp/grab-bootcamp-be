import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prisma, Forest as PrismaForest } from '@prisma/client';
import { getArgumentValues } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Forest implements PrismaForest {
  @Field(() => ID)
  mId: number;

  @Field(() => String)
  mName: string;

  @Field(() => GraphQLJSON)
  mCoordinates: Prisma.JsonValue;

  @Field(() => GraphQLJSON)
  mLastFFMC: Prisma.JsonValue;
  
}
