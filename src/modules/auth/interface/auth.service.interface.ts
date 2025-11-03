import { SignInResponseDto, SignUpResponseDto } from '@/modules/users/dto/user.response.dto';
import { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { SignInRequest } from '../dto/signIn.request.dto';
import { SignUpRequest } from '../dto/signup.request.dto';

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: SignInResponseDto;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  signUp(signUpInput: SignUpRequest): Promise<SignUpResponseDto>;
  signIn(signInInput: SignInRequest): Promise<SignInResponse>;
  signOut(user: AccessTokenPayload): Promise<void>;
  refreshToken(refresh: JwtPayload, refreshRaw: string): Promise<RefreshResponse>;
  socialSignIn(oauthUser: {
    provider: string;
    providerId: string;
    email?: string | null;
    name?: string | null;
  }): Promise<SignInResponse>;
}

export const AUTH_SERVICE = 'IAuthService';
