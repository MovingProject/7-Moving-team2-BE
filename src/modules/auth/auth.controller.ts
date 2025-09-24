import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Inject, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AUTH_SERVICE, type IAuthService } from './interface/auth.service.interface';
import { SignUpDto, signUpSchema } from './schema/signup.schema';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: IAuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }
}
