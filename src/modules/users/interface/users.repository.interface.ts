import { Prisma } from '@prisma/client';
import { SignUpRequest } from '../../auth/dto/signup.request.dto';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    driverProfile: true;
    consumerProfile: true;
  };
}>;

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithProfile | null>;
  findById(id: string): Promise<UserWithProfile | null>;
  createUser(signUpRequest: SignUpRequest, hashedPassword: string): Promise<UserWithProfile>;
}

export const USER_REPOSITORY = 'IUserRepository';
