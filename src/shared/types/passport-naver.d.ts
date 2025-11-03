// src/types/passport-naver.d.ts
declare module 'passport-naver' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface NaverProfile extends Record<string, any> {
    provider: string;
    id: string;
    displayName: string;
    emails?: { value: string }[];
    photos?: { value: string }[];
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    passReqToCallback?: boolean;
  }

  export interface VerifyCallback {
    (accessToken: string, refreshToken: string, profile: NaverProfile, done: (error: any, user?: any) => void): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }

  export { Strategy };
}
