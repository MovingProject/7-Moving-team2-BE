import { Area, ConsumerProfile, DriverProfile, MoveType, Role, User } from '@prisma/client';

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
  experience: number;
  bio: string;
  description: string;
  tel: string;
  nickname: string;
  image?: string;
}
export class EditConsumerProfileDto extends BaseUserDto {
  region: Area;
  service: MoveType;
  tel: string;
  image?: string;
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

  static toEditConsumerProfileDto(user: User, consumerProfile: ConsumerProfile): EditConsumerProfileDto {
    const dto = new EditConsumerProfileDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.tel = user.phoneNumber;
    dto.service = consumerProfile.serviceType;
    dto.region = consumerProfile.areas;
    dto.image = consumerProfile.image ?? undefined;

    return dto;
  }

  static toEditDriverProfileDto(
    user: User,
    driverProfile: DriverProfile,
    serviceTypes: string[],
    serviceAreas: string[],
  ): EditDriverProfileDto {
    const dto = new EditDriverProfileDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.service = serviceTypes;
    dto.region = serviceAreas;
    dto.bio = driverProfile.oneLiner;
    dto.description = driverProfile.description;
    dto.experience = driverProfile.careerYears;
    dto.tel = user.phoneNumber;
    dto.nickname = driverProfile.nickname;
    dto.image = driverProfile.image ?? undefined;

    return dto;
  }
}
