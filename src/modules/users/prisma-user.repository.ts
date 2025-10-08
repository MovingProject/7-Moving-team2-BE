import { SignUpRequest } from '@/modules/auth/dto/signup.request.dto';
import {
  IUserRepository,
  UserWithProfile,
  UserWithFullProfile,
} from '@/modules/users/interface/users.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }
  async findById(id: string): Promise<UserWithProfile | null> {
    return await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }
  async createUser(signUpInput: SignUpRequest, hashedPassword: string): Promise<UserWithProfile> {
    const { email, name, phoneNumber, role } = signUpInput;

    return await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phoneNumber,
        role,
      },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }

  async getProfileById(id: string): Promise<UserWithFullProfile | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        consumerProfile: true,
        driverProfile: {
          include: {
            driverServiceTypes: true,
            driverServiceAreas: true,
          },
        },
      },
    });
  }
}
