import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT'
}

export enum NotificationSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  CRITICAL = 'CRITICAL'
}

export class CreateNotificationDto {
  @IsString()
  mTitle: string;

  @IsString()
  mBody: string;

  @IsString()
  @IsOptional()
  mImage?: string;

  @IsEnum(NotificationType)
  mType: string;

  @IsEnum(NotificationSeverity)
  mSeverity: string;

  @IsOptional()
  @IsInt()
  mForestId?: number;
}