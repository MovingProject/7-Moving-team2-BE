import { Prisma } from '@prisma/client';
import { SignUpRequest } from '../../auth/dto/signup.request.dto';
import z from 'zod';
import { UpdateUserProfileDto } from '../dto/user.update.Dto';

const editConsumerProfileSchema = z.object({
  region: z.enum([
    'SEOUL',
    'GYEONGGI',
    'INCHEON',
    'GANGWON',
    'CHUNGBUK',
    'CHUNGNAM',
    'SEJONG',
    'DAEJEON',
    'JEONBUK',
    'JEONNAM',
    'GWANGJU',
    'GYEONGBUK',
    'GYEONGNAM',
    'DAEGU',
    'ULSAN',
    'BUSAN',
    'JEJU',
  ]),
  serviceType: z.enum(['SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE']),
  phoneNumber: z.string().min(10),
});

const editDriverProfileSchema = z.object({
  region: z.array(
    z.enum([
      'SEOUL',
      'GYEONGGI',
      'INCHEON',
      'GANGWON',
      'CHUNGBUK',
      'CHUNGNAM',
      'SEJONG',
      'DAEJEON',
      'JEONBUK',
      'JEONNAM',
      'GWANGJU',
      'GYEONGBUK',
      'GYEONGNAM',
      'DAEGU',
      'ULSAN',
      'BUSAN',
      'JEJU',
    ]),
  ),
  serviceType: z.array(z.enum(['SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE'])),
  careerYears: z.string(),
  oneLiner: z.string(),
  description: z.string(),
  phoneNumber: z.string().min(10),
});

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
    id: string;
    email: string;
    role: string;
  };
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithProfile | null>;
  findById(id: string): Promise<UserWithProfile | null>;
  createUser(signUpRequest: SignUpRequest, hashedPassword: string): Promise<UserWithProfile>;
  getProfileById(id: string): Promise<UserWithFullProfile | null>;
  updateProfile(id: string, dto: UpdateUserProfileDto): Promise<UserWithFullProfile>;
}

export const USER_REPOSITORY = 'IUserRepository';
