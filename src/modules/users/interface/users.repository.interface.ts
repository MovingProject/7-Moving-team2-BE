import { Prisma } from '@prisma/client';
import { SignUpRequest } from '../../auth/dto/signup.request.dto';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    driverProfile: true;
    consumerProfile: true;
  };
}>;

export type UserWithFullProfile = Prisma.UserGetPayload<{
  include: {
    driverProfile: {
      include: {
        driverServiceTypes: true;
        driverServiceAreas: true;
      };
    };
    consumerProfile: true;
  };
}>;

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithProfile | null>;
  findById(id: string): Promise<UserWithProfile | null>;
  createUser(signUpRequest: SignUpRequest, hashedPassword: string): Promise<UserWithProfile>;
  getProfileById(id: string): Promise<UserWithFullProfile | null>;
}

export const USER_REPOSITORY = 'IUserRepository';
