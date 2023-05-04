import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Notification as PrismaNotification } from "@prisma/client";

@ObjectType()
export class Notification implements PrismaNotification {
  @Field(() => ID)
  mId: number;

  @Field(() => String)
  mTitle: string;

  @Field(() => String)
  mBody: string;

  @Field(() => String, { nullable: true })
  mImage: string;

  @Field(() => String)
  mType: string;

  @Field(() => String)
  mSeverity: string;

  @Field(() => Number, { nullable: true })
  mForestId: number;

  @Field(() => Date)
  mCreatedAt: Date;
}