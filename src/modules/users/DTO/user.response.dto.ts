import { User, Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;

  static fromUser(user: User): UserResponseDto {
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = user.id;
    userResponseDto.email = user.email;
    userResponseDto.name = user.name;
    userResponseDto.role = user.role;
    userResponseDto.createdAt = user.createdAt;
    return userResponseDto;
  }
}
