import { Area, MoveType, Prisma } from '@prisma/client';
import { SignUpRequest } from '../../auth/dto/signup.request.dto';
import { UpdateUserProfileDto } from '../dto/user.update.Dto';

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

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

export type PartialUserProfile = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  phoneNumber: string;
  // 드라이버 필드
  nickname?: string;
  careerYears?: string;
  oneLiner?: string;
  description?: string;
  rating?: number;
  driverServiceAreas?: Area[];
  driverServiceTypes?: MoveType[];
  // 소비자 필드
  serviceType?: MoveType;
  areas?: Area;
  image?: string;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithProfile | null>;
  findById(id: string): Promise<UserWithFullProfile | null>;
  createUser(signUpRequest: SignUpRequest, hashedPassword: string): Promise<UserWithProfile>;
  getProfileById(id: string): Promise<UserWithFullProfile | null>;
  updateProfile(id: string, dto: UpdateUserProfileDto): Promise<PartialUserProfile>;
}

export const USER_REPOSITORY = 'IUserRepository';
