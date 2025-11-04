import type { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { CookiesService } from '@/shared/utils/cookies.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthUser } from './decorators/auth-user.decorator';
import { RefreshPayload } from './decorators/refresh-payload.decorator';
import { RefreshRaw } from './decorators/refresh-raw.decorator';
import { SignInRequestDto, signInSchema } from './dto/signIn.request.dto';
import { SignUpRequestDto, signUpSchema } from './dto/signup.request.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AUTH_SERVICE, type IAuthService } from './interface/auth.service.interface';
import { AuthGuard } from '@nestjs/passport';
import type { OAuthRequest, OAuthUser } from './interface/oauth-user.interface';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  @Post('signUp')
  @ApiOperation({ summary: '로컬 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() dto: SignUpRequestDto) {
    return this.authService.signUp(dto);
  }

  @Post('signIn')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() dto: SignInRequestDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.signIn(dto);
    this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Post('signOut')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async signOut(@AuthUser() user: AccessTokenPayload, @Res({ passthrough: true }) res: Response) {
    await this.authService.signOut(user);
    this.cookiesService.clearAuthCookies(res);
    return { message: 'Successfully signed out' };
  }

  @Post('refresh')
  @ApiOperation({ summary: '액세스토큰 재발급' })
  @ApiResponse({ status: 200, description: '토큰 재발급 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @RefreshPayload() refresh: JwtPayload,
    @RefreshRaw() refreshRaw: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(refresh, refreshRaw);
    this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
    return { message: '토큰 재발급 성공' };
  }

  // 🚀 [소셜 로그인 - Google]
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: '구글 로그인 요청' })
  async googleAuth(@Query('role') role: 'CONSUMER' | 'DRIVER' = 'CONSUMER') {
    // 구글 로그인 페이지로 리다이렉트됨
    return { message: `Redirecting to Google for role=${role}` };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: OAuthRequest, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = req.user;
    this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
    const frontendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const userData = encodeURIComponent(JSON.stringify(user));

    return res.redirect(`${frontendUrl}/auth/google/callback?user=${userData}`);
  }

  // 🚀 [소셜 로그인 - Kakao]
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 요청' })
  async kakaoAuth() {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 콜백' })
  async kakaoAuthCallback(@Req() req: OAuthRequest, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = req.user as OAuthUser;
    this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  // 🚀 [소셜 로그인 - Naver]
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: '네이버 로그인 요청' })
  async naverAuth() {}

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: '네이버 로그인 콜백' })
  async naverAuthCallback(@Req() req: OAuthRequest, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = req.user as OAuthUser;
    this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }
}
