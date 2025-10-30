import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AUTH_SERVICE, type IAuthService, type ISocialSignInPayload } from '../interface/auth.service.interface';
import { Request } from 'express';
import { Role } from '@prisma/client';

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
    const role = req.query.state as Role;

    if (role !== Role.DRIVER && role !== Role.CONSUMER) {
      return done(new BadRequestException('Invalid role state provided.'), false);
    }

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
      role,
    };

    try {
      // authService.socialSignIn 호출, { type: 'login', ... } 또는 { type: 'register', ... }를 반환
      const socialSignInResult = await this.authService.socialSignIn(payload);

      // 결과를 done 콜백으로 전달 (성공 시에는 2번째 인자에 user 객체 전달)
      done(null, socialSignInResult);
    } catch (e) {
      done(e, false);
    }
  }
}
