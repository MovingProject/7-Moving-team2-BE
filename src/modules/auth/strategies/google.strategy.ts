import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleOAuthStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AUTH_SERVICE } from '../interface/auth.service.interface';
import type { IAuthService } from '../interface/auth.service.interface';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleOAuthStrategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: GoogleProfile) {
    const role = (req.query.state  as 'CONSUMER' | 'DRIVER') ?? 'CONSUMER';

    const payload = {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      role,
    };

    console.log('🐞 GoogleStrategy role:', req.query.state);
    console.log('🐞 payload:', payload);

    // ✅ AuthService의 소셜 로그인 로직 호출
    const user = await this.authService.socialSignIn(payload);
    return user;
  }
}
