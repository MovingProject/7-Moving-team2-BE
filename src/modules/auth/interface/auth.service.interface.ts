import { SignInResponseDto, SignUpResponseDto } from '@/modules/users/dto/user.response.dto';
import { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { SignInRequest } from '../dto/signIn.request.dto';
import { SignUpRequest } from '../dto/signup.request.dto';
import { UserDtoFactory } from '../../users/dto/user.response.dto';
import { User, Role } from '@prisma/client';

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: SignInResponseDto;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ValidateSocialUserDto {
  provider: 'google' | 'kakao' | 'naver';
  providerId: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface SocialProfileDto {
  provider: 'google' | 'kakao' | 'naver';
  providerId: string;
  email: string;
  name: string;
  image?: string | null;
}

export type SocialSignInDto = SocialProfileDto;

export interface ISocialSignInPayload {
  provider: 'google'; // 또는 'kakao', 'naver' 등
  providerId: string;
  email: string;
  name: string;
  image: string | null;
  role: Role; // DRIVER 또는 CONSUMER
}

// ★ 2. socialSignIn 메서드가 반환하는 타입
export type SocialSignInResult =
  | {
      type: 'login';
      data: {
        accessToken: string;
        refreshToken: string;
        user: ReturnType<typeof UserDtoFactory.toSignInResponseDto>;
      };
    }
  | {
      type: 'register';
      data: ISocialSignInPayload;
    };

export interface IAuthService {
  signUp(signUpInput: SignUpRequest): Promise<SignUpResponseDto>;
  signIn(signInInput: SignInRequest): Promise<SignInResponse>;
  signOut(user: AccessTokenPayload): Promise<void>;
  refreshToken(refresh: JwtPayload, refreshRaw: string): Promise<RefreshResponse>;
  socialSignIn(payload: ISocialSignInPayload): Promise<SocialSignInResult>;
}

export const AUTH_SERVICE = 'IAuthService';
