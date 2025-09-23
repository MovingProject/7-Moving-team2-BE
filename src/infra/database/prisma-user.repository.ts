import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IUserRepository } from '@/modules/users/interface/users.repository.interface';
import { SignUpInput } from '@/modules/auth/schema/signup.schema';
import { User } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 이메일로 사용자를 찾습니다.
   * @param email 사용자 이메일
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param signUpInput 회원가입 DTO
   * @param hashedPassword 암호화된 비밀번호
   */
  async createUser(signUpInput: SignUpInput, hashedPassword: string): Promise<User> {
    const { email, name, phoneNumber, role } = signUpInput;

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phoneNumber,
        role,
      },
    });
  }
}
