import { Area, MoveType } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConsumerProfileDto {
  @IsUUID()
  userId: string; // 이미 존재하는 User.id

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(MoveType)
  serviceType?: MoveType;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Area, { each: true })
  areas?: Area[]; // Area[]
}
