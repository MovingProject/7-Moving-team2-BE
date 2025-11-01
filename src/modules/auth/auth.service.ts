import { UserDtoFactory } from '@/modules/users/dto/user.response.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@/shared/exceptions';
import { UserAlreadyExistsException } from '@/shared/exceptions/user.exception';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/jwt.service.interface';
import { JwtPayload, AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '../users/interface/users.repository.interface';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { SignUpRequest } from './dto/signup.request.dto';
import { IAuthService, ISocialSignInPayload, SocialSignInResult } from './interface/auth.service.interface';
import { TOKEN_REPOSITORY, type ITokenRepository } from './interface/token.repository.interface';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { ConfigNotFoundException } from '@/shared/exceptions/config-not-found.exception';
import { randomUUID } from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,

    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,

    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,

    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpRequest: SignUpRequest) {
    const { email, password } = signUpRequest;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await this.hashingService.hash(password);

    const user = await this.userRepository.createUser(signUpRequest, hashedPassword);

    return UserDtoFactory.toSignUpResponseDto(user);
  }

  async signIn(signInInput: SignInRequestDto) {
    const { email, password, role } = signInInput;

    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      throw new NotFoundException('존재하지 않는 email입니다.');
    }

    if (!existingUser.passwordHash) {
      throw new BadRequestException('소셜 로그인으로 가입한 유저입니다.');
    }
    const hashedPassword = existingUser.passwordHash;

    const isMatch = await this.hashingService.compare(password, hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    if (role !== existingUser.role) {
      throw new ForbiddenException('해당 권한으로 로그인할 수 없습니다.');
    }

    const { accessToken, refreshToken } = await this._generateTokens(existingUser);

    return {
      accessToken,
      refreshToken,
      user: UserDtoFactory.toSignInResponseDto(existingUser),
    };
  }

  async signOut(user: AccessTokenPayload) {
    await this.tokenRepository.deleteTokenByJti(user.jti);
  }

  async refreshToken(refresh: JwtPayload, refreshRaw: string) {
    const { sub, jti } = refresh;

    if (!refreshRaw) {
      throw new UnauthorizedException('원본 리프레시 토큰이 없습니다.', { errorType: 'TOKEN_RAW_MISSING' });
    }

    const storedRefreshToken = await this.tokenRepository.findTokenByJti(jti);
    if (!storedRefreshToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.', { errorType: 'TOKEN_NOT_FOUND' });
    }

    const isMatch = await this.hashingService.compare(refreshRaw, storedRefreshToken.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('리프레시 토큰 해시가 일치하지 않습니다.', { errorType: 'TOKEN_HASH_MISMATCH' });
    }

    if (sub !== storedRefreshToken?.userId) {
      throw new UnauthorizedException('토큰 소유자 불일치', { errorType: 'TOKEN_SUB_MISMATCH' });
    }

    const now = new Date();
    if (storedRefreshToken.expiresAt <= now) {
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.', { errorType: 'TOKEN_EXPIRED' });
    }

    if (storedRefreshToken.usedAt) {
      throw new UnauthorizedException('이미 사용된 리프레시 토큰입니다.', { errorType: 'TOKEN_ALREADY_USED' });
    }
    await this.tokenRepository.markTokenAsUsed(storedRefreshToken.id);

    const newJti = randomUUID();
    const refreshToken = await this.jwtService.signRefreshToken({ sub, jti: newJti });
    const refreshHash = await this.hashingService.hash(refreshToken);
    const raw = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const maybeParsed: unknown = (ms as unknown as (v: string | number, opts?: { long?: boolean }) => string | number)(
      raw,
    );
    if (typeof maybeParsed !== 'number') {
      throw new ConfigNotFoundException(`JWT_REFRESH_EXPIRES_IN 형식이 잘못됨: ${raw}`);
    }
    const jwtRefreshExpiresInMs: number = maybeParsed;

    const expiresAt = new Date(Date.now() + jwtRefreshExpiresInMs);

    await this.tokenRepository.saveRefreshToken(storedRefreshToken.userId, refreshHash, newJti, expiresAt);

    const user = await this.userRepository.findById(sub);
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저 ID입니다.');
    }
    const role = user.role;
    const accessToken = await this.jwtService.signAccessToken({ sub, jti: newJti, role });

    return { accessToken, refreshToken };
  }

  async socialSignIn(payload: ISocialSignInPayload): Promise<SocialSignInResult> {
    const { provider, providerId, email } = payload;

    // 이메일로 유저를 먼저 찾음
    const userByEmail = await this.userRepository.findByEmail(email);

    if (userByEmail) {
      // 이메일이 존재할 경우, provider가 다른지 확인
      if (userByEmail.provider && userByEmail.provider !== provider) {
        throw new ConflictException(`해당 이메일은 이미 ${userByEmail.provider}(으)로 가입되어 있습니다.`);
      }

      // 소셜 계정을 연동(provider, providerId) 업데이트(로컬 가입 유저를 소셜 연동시키거나, 기존 소셜 유저 정보 업데이트)
      const user = await this.userRepository.updateUserProvider(userByEmail.id, provider, providerId);

      // 토큰을 발급하고 'login' 타입을 반환
      const { accessToken, refreshToken } = await this._generateTokens(user);
      return {
        type: 'login',
        data: {
          accessToken,
          refreshToken,
          user: UserDtoFactory.toSignInResponseDto(user),
        },
      };
    } else {
      // 이메일이 존재하지 않을 경우 (신규 가입)
      return {
        type: 'signup',
        data: payload,
      };
    }
  }

  private async _generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const jti = randomUUID();
    const refreshTokenPayload: JwtPayload = { sub: user.id, jti: jti };
    const refreshToken = await this.jwtService.signRefreshToken(refreshTokenPayload);
    const hashedRefreshToken = await this.hashingService.hash(refreshToken);

    const raw = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    const maybeParsed: unknown = (ms as unknown as (v: string | number, opts?: { long?: boolean }) => string | number)(
      raw,
    );
    if (typeof maybeParsed !== 'number') {
      throw new ConfigNotFoundException(`JWT_REFRESH_EXPIRES_IN 형식이 잘못됨: ${raw}`);
    }
    const jwtRefreshExpiresInMs: number = maybeParsed;
    const expiresAt = new Date(Date.now() + jwtRefreshExpiresInMs);

    const storedRerfreshToken = await this.tokenRepository.saveRefreshToken(
      user.id,
      hashedRefreshToken,
      jti,
      expiresAt,
    );

    const accessTokenPayload: AccessTokenPayload = {
      sub: user.id,
      jti: storedRerfreshToken.jti,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAccessToken(accessTokenPayload);

    return { accessToken, refreshToken };
  }
}
