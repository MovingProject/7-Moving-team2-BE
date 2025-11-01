import type { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { CookiesService } from '@/shared/utils/cookies.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
  UsePipes,
  Get,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthUser } from './decorators/auth-user.decorator';
import { RefreshPayload } from './decorators/refresh-payload.decorator';
import { RefreshRaw } from './decorators/refresh-raw.decorator';
import { SignInRequestDto, signInSchema } from './dto/signIn.request.dto';
import { SignUpRequestDto, signUpSchema } from './dto/signup.request.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import {
  AUTH_SERVICE,
  type IAuthService,
  type SocialSignInResult,
  type ISocialSignInPayload,
} from './interface/auth.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  private readonly FRONTEND_SIGNUP_URL: string;

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    private readonly cookiesService: CookiesService,
    private readonly configService: ConfigService,
  ) {
    this.FRONTEND_SIGNUP_URL = this.configService.getOrThrow<string>('FRONTEND_SIGNUP_URL');
  }

  @Post('signUp')
  @ApiOperation({ summary: '로컬 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() dto: SignUpRequestDto) {
    try {
      const result = await this.authService.signUp(dto);

      return result;
    } catch (error) {
      console.error(`[signUp] ERROR: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('signIn')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() dto: SignInRequestDto, @Res({ passthrough: true }) res: Response) {
    console.log(`[signIn] Start - DTO: ${JSON.stringify(dto, null, 2)}`);
    try {
      console.log('[signIn] Calling authService.signIn...');
      const { accessToken, refreshToken, user } = await this.authService.signIn(dto);

      this.cookiesService.setAuthCookies(res, accessToken, refreshToken);

      return user;
    } catch (error) {
      console.error(`[signIn] ERROR: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('signOut')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async signOut(@AuthUser() user: AccessTokenPayload, @Res({ passthrough: true }) res: Response) {
    try {
      await this.authService.signOut(user);
      this.cookiesService.clearAuthCookies(res);
      return { message: 'Successfully signed out' };
    } catch (error) {
      console.error(`[signOut] ERROR: ${error.message}`, error.stack);
      throw error;
    }
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
    console.log(`[refresh] Start - Payload: ${JSON.stringify(refresh, null, 2)}`);
    try {
      console.log('[refresh] Calling authService.refreshToken...');
      const { accessToken, refreshToken } = await this.authService.refreshToken(refresh, refreshRaw);
      console.log('[refresh] Service Success');

      console.log('[refresh] Setting auth cookies...');
      this.cookiesService.setAuthCookies(res, accessToken, refreshToken);

      console.log('[refresh] Done - Returning message');
      return { message: '토큰 재발급 성공' };
    } catch (error) {
      console.error(`[refresh] ERROR: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ====== Google OAuth ======

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {
    console.log('[googleAuth] Start - Redirecting to Google...');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const socialResult = req.user as SocialSignInResult;

      if (!socialResult) {
        console.error('[google/callback] FATAL: req.user is null/undefined. Passport strategy failed.');
        return res.status(500).json({ message: 'Authentication failed: No user data from provider.' });
      }

      if (socialResult.type === 'login') {
        const { accessToken, refreshToken, user } = socialResult.data;
        this.cookiesService.setAuthCookies(res, accessToken, refreshToken);
        res.json(user);
      } else {
        const { ...profile } = socialResult.data as ISocialSignInPayload;

        const params = new URLSearchParams(profile as any).toString();
        const redirectUrl = `${this.FRONTEND_SIGNUP_URL}?${params}`;

        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error(`[google/callback] ERROR: ${error.message}`, error.stack);
      res.status(500).json({ message: 'Internal server error during callback processing.' });
    }
  }
}
