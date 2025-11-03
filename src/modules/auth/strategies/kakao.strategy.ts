import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KakaoOAuthStrategy, KakaoProfile } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(KakaoOAuthStrategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: KakaoProfile) {
    const kakaoAccount = profile._json?.kakao_account || {};
    const email = kakaoAccount.email || `${profile.id}@kakao.temp`;

    return {
      provider: 'kakao',
      providerId: profile.id.toString(),
      email,
      name: kakaoAccount.profile?.nickname || '카카오 사용자',
      picture: kakaoAccount.profile?.profile_image_url,
    };
  }
}
