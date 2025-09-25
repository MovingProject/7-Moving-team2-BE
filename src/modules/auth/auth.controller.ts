import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { SignInRequestDto, signInSchema } from './dto/signIn.request.dto';
import { SignUpRequestDto, signUpSchema } from './dto/signup.request.dto';
import { AUTH_SERVICE, type IAuthService } from './interface/auth.service.interface';
import { AuthGuard } from './guards/auth.guard';
import { AuthUser } from './decorators/auth-user.decorator';
import { type AccessTokenPayload } from '@/shared/jwt/jwt.service.interface';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: IAuthService) {}

  @Post('signup')
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

    res.cookie('__Host-access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('__Host-rt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth/refresh',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Post('signOut')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async signOut(@AuthUser() user: AccessTokenPayload, @Res({ passthrough: true }) res: Response) {
    await this.authService.signOut(user);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax' as const,
    };
    res.clearCookie('__Host-access_token', cookieOptions);
    res.clearCookie('__Host-refresh_token', cookieOptions);

    return { message: 'Successfully signed out' };
  }
}
