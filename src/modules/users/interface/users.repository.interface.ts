import { User } from '@prisma/client';
import { SignUpInput } from '../../auth/schema/signup.schema';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(signUpInput: SignUpInput, hashedPassword: string): Promise<User>;
}

export const USER_REPOSITORY = 'IUserRepository';
