import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export enum NotificationType {
  // info
  INFO = 'INFO',

  // level 1 alert
  WARNING = 'WARNING',

  // level 2 alert
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
  mType: NotificationType;

  @IsEnum(NotificationSeverity)
  mSeverity: NotificationSeverity;

  @IsOptional()
  @IsInt()
  mForestId?: number;
}