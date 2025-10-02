// src/users/dto/update-user.dto.ts
import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { MoveType, Area, User, DriverProfile } from '@prisma/client';

/**
 * 1️⃣ Base DTO
 * - 모든 유저 공통 필드
 * - 이름, 이메일, 전화번호, 현재/새 비밀번호, 새 비밀번호 확인, 프로필 이미지
 */
export class BaseUpdateUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  tel?: string;

  @IsOptional()
  @IsString()
  password?: string; // 현재 비밀번호 확인용

  @IsOptional()
  @IsString()
  newPassword?: string; // 새 비밀번호

  @IsOptional()
  @IsString()
  confirmPassword?: string; // 새 비밀번호 확인용

  @IsOptional()
  @IsString()
  profileImage?: string; // 프로필 이미지 URL
}

/**
 * 2️⃣ 고객용 DTO
 * - Base DTO 상속
 * - 고객 전용 필드: 서비스, 지역
 */
export class UpdateConsumerProfileDto extends BaseUpdateUserDto {
  @IsOptional()
  @IsEnum(MoveType)
  service?: MoveType; // 고객 서비스 타입

  @IsOptional()
  @IsEnum(Area)
  region?: Area; // 고객 지역
}

/**
 * 3️⃣ 드라이버용 DTO
 * - Base DTO 상속
 * - 드라이버 전용 필드: 별명, 경력, 한줄소개, 상세설명, 제공서비스, 서비스 가능 지역
 */
export class UpdateDriverProfileDto extends BaseUpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string; // 별명

  @IsOptional()
  @IsString()
  experience?: string; // 경력

  @IsOptional()
  @IsString()
  bio?: string; // 한줄소개

  @IsOptional()
  @IsString()
  description?: string; // 상세설명

  @IsOptional()
  @IsArray()
  serviceList?: string[]; // 제공서비스

  @IsOptional()
  @IsArray()
  serviceArea?: string[]; // 서비스 가능 지역
}

export class PatchDtoFactory {
  static toUpdateDriverProfileDto(
    user: User,
    driverProfile: DriverProfile,
    service: string[],
    region: string[],
  ): UpdateDriverProfileDto {
    const dto = new UpdateDriverProfileDto();

    //불변필드
    dto.id = user.id;
    dto.email = user.email;

    //수정가능한필드
    dto.name = user.name;
    dto.tel = user.phoneNumber;
    //고민좀
    dto.nickname = driverProfile.nickname;
    dto.experience =driverProfile.careerYears;
    dto.bio = driverProfile.oneLiner;

    return dto;
  }
}
