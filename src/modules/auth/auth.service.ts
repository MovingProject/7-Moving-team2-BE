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
import ms from 'ms';
import { ConfigNotFoundException } from '@/shared/exceptions/config-not-found.exception';
import { randomUUID } from 'crypto';

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
}
