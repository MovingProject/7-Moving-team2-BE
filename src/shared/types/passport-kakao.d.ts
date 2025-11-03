// src/types/passport-kakao.d.ts
declare module 'passport-kakao' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface KakaoProfile extends Record<string, any> {
    provider: string;
    id: string;
    username?: string;
    displayName?: string;
    _json: {
      id: number;
      connected_at?: string;
      kakao_account?: {
        profile?: {
          nickname?: string;
          profile_image_url?: string;
          thumbnail_image_url?: string;
        };
        email?: string;
        age_range?: string;
        gender?: string;
      };
    };
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret?: string;
    callbackURL: string;
    passReqToCallback?: boolean;
  }

  export interface VerifyCallback {
    (
      accessToken: string,
      refreshToken: string,
      profile: KakaoProfile,
      done: (error: any, user?: any) => void,
    ): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }

  export { Strategy };
}
