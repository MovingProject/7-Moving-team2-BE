import { User, Role, DriverProfile, ConsumerProfile } from '@prisma/client';

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
}
