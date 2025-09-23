import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Inject, Post, UsePipes } from '@nestjs/common'; // Inject 추가
import { AUTH_SERVICE, type IAuthService } from './interface/auth.service.interface'; // AUTH_SERVICE 토큰 추가
import type { SignUpInput } from './schema/signup.schema';
import { signUpSchema } from './schema/signup.schema';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService, // @Inject 추가
  ) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() signUpInput: SignUpInput) {
    // 유효성 검사는 파이프가, 실제 로직은 서비스가 담당합니다. 완벽한 역할 분리입니다.
    return this.authService.signUp(signUpInput);
  }
}
