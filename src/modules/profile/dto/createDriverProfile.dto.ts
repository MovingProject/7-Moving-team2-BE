import { Area, MoveType } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateDriverProfileDto {
  @IsUUID()
  userId: string; // 이미 존재하는 User.id

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @MaxLength(30)
  nickname: string; // unique

  @IsOptional()
  @IsInt()
  @Min(0)
  careerYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  oneLiner?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Area, { each: true })
  serviceAreas?: Area[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(MoveType, { each: true })
  MoveTypes?: MoveType[];
}
