import {
  User,
  Role,
  DriverProfile,
  ConsumerProfile,
  DriverServiceArea,
  DriverServiceType,
  MoveType,
  Area,
} from '@prisma/client';

type UserWithProfile = User & {
  driverProfile: DriverProfile | null;
  consumerProfile: ConsumerProfile | null;
};

export class BaseUserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}
export class SignUpResponseDto extends BaseUserDto {}

export class SignInResponseDto extends BaseUserDto {
  isProfileRegistered: boolean;
  profileId?: string;
}

export class EditDriverProfileDto extends BaseUserDto {
  region: string[];
  service: string[];
  experience: string; //경력
  bio: string; // 한줄소개
  description: string; //상세설명
  tel: string;
}
export class EditConsumerProfileDto extends BaseUserDto {
  region: Area;
  service: MoveType;
  tel: string;
}

export class UserDtoFactory {
  static toSignUpResponseDto(user: User): SignUpResponseDto {
    const dto = new SignUpResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    return dto;
  }

  static toSignInResponseDto(user: UserWithProfile): SignInResponseDto {
    const dto = new SignInResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.isProfileRegistered = !!(user.driverProfile || user.consumerProfile);
    if (dto.isProfileRegistered) {
      dto.profileId = user.driverProfile?.id || user.consumerProfile?.id;
    }
    return dto;
  }

  static toEditConsumerProfileDto(user: User, consumberProfile: ConsumerProfile): EditConsumerProfileDto {
    const dto = new EditConsumerProfileDto();

    dto.id = user.id; //id
    dto.name = user.name; // 이름
    dto.email = user.email; // 이메일
    dto.tel = user.phoneNumber; //전화번호
    dto.service = consumberProfile.serviceType; //이용서비스 MoveType enum
    dto.region = consumberProfile.areas; //사는지역 Area eum
    //여기서 프로필이미지 유무도 생각해보면좋은데 일단은 그냥넘어감
    return dto;
  }

  static toEditDriverProfileDto(
    user: User,
    driverProfile: DriverProfile,
    serviceTypes: string[],
    serviceAreas: string[],
  ): EditDriverProfileDto {
    const dto = new EditDriverProfileDto();

    dto.id = user.id; //id
    dto.name = user.name; // 이름
    dto.email = user.email; // 이메일
    dto.service = serviceTypes; //이용서비스
    dto.region = serviceAreas; //사는지역
    dto.bio = driverProfile.oneLiner; // 한줄소개
    dto.description = driverProfile.description; // 상세설명
    dto.experience = driverProfile.careerYears; // 경력
    //여기서 프로필이미지 유무도 생각해보면좋은데 일단은 그냥넘어감

    return dto;
  }
}
