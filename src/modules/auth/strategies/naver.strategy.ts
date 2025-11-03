import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverOAuthStrategy, NaverProfile } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(NaverOAuthStrategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: NaverProfile) {
    const json = profile._json;
    return {
      provider: 'naver',
      providerId: json.id,
      email: json.email || `${json.id}@naver.temp`,
      name: json.nickname || json.name || '네이버 사용자',
      picture: json.profile_image,
    };
  }
}
