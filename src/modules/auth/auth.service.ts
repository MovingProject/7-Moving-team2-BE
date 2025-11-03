import { UserDtoFactory } from '@/modules/users/dto/user.response.dto';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@/shared/exceptions';
import { UserAlreadyExistsException } from '@/shared/exceptions/user.exception';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/jwt.service.interface';
import { JwtPayload, AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '../users/interface/users.repository.interface';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { SignUpRequest } from './dto/signup.request.dto';
import { IAuthService } from './interface/auth.service.interface';
import { TOKEN_REPOSITORY, type ITokenRepository } from './interface/token.repository.interface';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { ConfigNotFoundException } from '@/shared/exceptions/config-not-found.exception';
import { randomUUID } from 'crypto';
import { PrismaTransactionRunner } from '@/shared/prisma/prisma-transaction-runner';

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
    private readonly transactionRunner: PrismaTransactionRunner,
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

    const jti = randomUUID();
    const refreshTokenPayload: JwtPayload = { sub: existingUser.id, jti: jti };
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
      existingUser.id,
      hashedRefreshToken,
      jti,
      expiresAt,
    );

    const accessTokenPayload: AccessTokenPayload = {
      sub: existingUser.id,
      jti: storedRerfreshToken.jti,
      role: existingUser.role,
    };
    const accessToken = await this.jwtService.signAccessToken(accessTokenPayload);

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

  async socialSignIn(oauthUser: {
    provider: string;
    providerId: string;
    email?: string | null;
    name?: string | null;
    role?: 'CONSUMER' | 'DRIVER';
  }) {
    return this.transactionRunner.run(async (tx) => {
      const { provider, providerId, email, name, role } = oauthUser;

      // 1️⃣ provider + providerId 로 기존 소셜 유저 찾기
      let user = await this.userRepository.findByProvider(provider, providerId, tx);

      // 2️⃣ 이메일 기반 기존 유저 확인
      if (!user && email) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
          user = await this.userRepository.updateProvider(existing.id, provider, providerId, tx);
        }
      }

      console.log('🚀 socialSignIn 받은 role:', oauthUser.role);
      // 3️⃣ 신규 소셜 유저 생성
      if (!user) {
        user = await this.userRepository.createSocialUser(
          { provider, providerId, email, name, role: oauthUser.role },
          tx,
        );
      }

      if (!user) {
        throw new BadRequestException('유저 정보를 생성할 수 없습니다.');
      }

      // 4️⃣ JWT 발급 및 RefreshToken 저장
      const jti = randomUUID();
      const refreshPayload: JwtPayload = { sub: user.id, jti };
      const refreshToken = await this.jwtService.signRefreshToken(refreshPayload);
      const hashedRefresh = await this.hashingService.hash(refreshToken);

      const raw = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
      const parsed = ms(raw as StringValue); //해결안됨 걍써봤는데 사라짐 추후수정필요할듯?
      if (typeof parsed !== 'number') {
        throw new ConfigNotFoundException(`JWT_REFRESH_EXPIRES_IN 형식이 잘못됨: ${raw}`);
      }
      const jwtRefreshExpiresInMs = parsed;

      if (typeof jwtRefreshExpiresInMs !== 'number') {
        throw new ConfigNotFoundException(`JWT_REFRESH_EXPIRES_IN 형식이 잘못됨: ${raw}`);
      }

      const expiresAt = new Date(Date.now() + jwtRefreshExpiresInMs);
      await this.tokenRepository.saveRefreshToken(user.id, hashedRefresh, jti, expiresAt, tx);

      const accessPayload: AccessTokenPayload = {
        sub: user.id,
        jti,
        role: user.role,
      };
      const accessToken = await this.jwtService.signAccessToken(accessPayload);

      return {
        accessToken,
        refreshToken,
        user: UserDtoFactory.toSignInResponseDto(user),
      };
    });
  }
}
