import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { Area, MoveType, ConsumerProfile } from '@prisma/client';

// -----------------------------------------------------------------------------
// 1. 요청(Request) DTO: 프로필 '생성' 시 사용
// -----------------------------------------------------------------------------

// Zod 스키마를 사용하여 요청 본문의 유효성을 검증합니다.
const CreateConsumerProfileSchema = z.object({
  /**
   * 프로필 이미지 URL (선택 사항)
   * @example "https://example.com/profile.jpg"
   */
  image: z.string().url('유효한 URL 형식이 아닙니다.').optional().nullable(),

  /**
   * 주로 이용하는 서비스 타입
   */
  serviceType: z.nativeEnum(MoveType, {
    errorMap: () => ({ message: '유효한 서비스 타입을 선택해주세요.' }),
  }),

  /**
   * 주로 활동하는 지역
   */
  areas: z.nativeEnum(Area, {
    errorMap: () => ({ message: '유효한 지역을 선택해주세요.' }),
  }),
});

// Zod 스키마를 NestJS에서 사용할 수 있는 DTO 클래스로 변환합니다.
// 이 클래스를 컨트롤러에서 @Body() 타입으로 사용합니다.
export class CreateConsumerProfileDto extends createZodDto(CreateConsumerProfileSchema) {}

// -----------------------------------------------------------------------------
// 2. 응답(Response) DTO: 클라이언트에 '반환' 시 사용
// -----------------------------------------------------------------------------

// 응답 데이터의 기본 구조를 정의하는 클래스 (기존 코드 유지)
export class ConsumerProfileResponseDto {
  id: string;
  consumerId: string;
  image: string | null;
  serviceType: MoveType;
  areas: Area;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  /**
   * Prisma의 ConsumerProfile 모델을 응답 DTO 형식으로 변환하는 정적 메서드
   * @param profile - Prisma를 통해 조회한 ConsumerProfile 객체
   * @returns ConsumerProfileResponseDto
   */
  static from(profile: ConsumerProfile): ConsumerProfileResponseDto {
    const dto = new ConsumerProfileResponseDto();
    dto.id = profile.id;
    dto.consumerId = profile.consumerId;
    dto.image = profile.image ?? null;
    dto.serviceType = profile.serviceType;
    dto.areas = profile.areas;
    dto.createdAt = profile.createdAt;
    dto.updatedAt = profile.updatedAt;
    dto.deletedAt = profile.deletedAt ?? undefined;
    return dto;
  }
}
