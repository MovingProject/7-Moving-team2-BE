import { SignInResponseDto, SignUpResponseDto } from '@/modules/users/dto/user.response.dto';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { SignInRequest } from '../dto/signIn.request.dto';
import { SignUpRequest } from '../dto/signup.request.dto';

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
