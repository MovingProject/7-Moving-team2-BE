import { AccessTokenPayload } from '@/shared/jwt/jwt.service.interface';
import { SignInRequest } from '../dto/signIn.request.dto';
import { SignUpRequest } from '../dto/signup.request.dto';
import { SignInResponseDto, SignUpResponseDto } from '@/modules/users/dto/user.response.dto';

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: SignInResponseDto;
}

export interface IAuthService {
  signUp(signUpInput: SignUpRequest): Promise<SignUpResponseDto>;
  signIn(signInInput: SignInRequest): Promise<SignInResponse>;
  signOut(user: AccessTokenPayload): Promise<void>;
}

export const AUTH_SERVICE = 'IAuthService';
