import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AUTH_SERVICE, type IAuthService, type ISocialSignInPayload } from '../interface/auth.service.interface';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string | undefined,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName ?? '';
    const providerId = profile.id;
    const image = profile.photos?.[0]?.value ?? null;

    if (!email || !providerId) {
      return done(new UnauthorizedException('Google profile is missing email or id'), false);
    }

    const payload: ISocialSignInPayload = {
      provider: 'google',
      providerId,
      email,
      name,
      image,
    };

    try {
      const socialSignInResult = await this.authService.socialSignIn(payload);

      done(null, socialSignInResult);
    } catch (e) {
      done(e, false);
    }
  }
}
