import { UserResponseDto } from '@/modules/users/DTO/user.response.dto';
import { SignUpInput } from '../schema/signup.schema';
export interface IAuthService {
  signUp(signUpInput: SignUpInput): Promise<UserResponseDto>;
}

export const AUTH_SERVICE = 'IAuthService';
