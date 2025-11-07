import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookiesService {
  constructor(private readonly config: ConfigService) {}

  private get isProd() {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  private get useSecure() {
    return this.isProd;
  }

  private toNumber(v: unknown, fallback: number): number {
    const n = typeof v === 'string' ? Number(v) : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private pickSameSite(envVal: string | undefined, fallback: CookieOptions['sameSite']) {
    const v = (envVal as CookieOptions['sameSite']) ?? fallback;

    if (v === 'none' && !this.useSecure) return 'lax';
    return v;
  }

  public get accessCookieName() {
    const prefix = this.useSecure ? (this.config.get<string>('ACCESS_COOKIE_PREFIX') ?? '__Host-') : '';
    return `${prefix}access_token`;
  }

  public get refreshCookieName() {
    const prefix = this.useSecure ? (this.config.get<string>('REFRESH_COOKIE_PREFIX') ?? '__Secure-') : '';
    return `${prefix}refresh_token`;
  }

  private buildAccessOpts(): CookieOptions {
    const sameSite = this.pickSameSite(this.config.get<string>('ACCESS_SAMESITE'), this.isProd ? 'none' : 'lax');
    const maxAge = this.toNumber(this.config.get('JWT_ACCESS_MAX_AGE_MS'), 900_000);
    const opts: CookieOptions = {
      httpOnly: true,
      secure: this.useSecure,
      path: '/',
      sameSite,
      maxAge,
      ...(this.isProd ? { partitioned: true } : {}),
    };

    if (this.isProd) {
      const domain = this.config.get<string>('COOKIE_DOMAIN');
      if (domain) {
        opts.domain = domain;
      }
    }
    return opts;
  }

  private buildRefreshOpts(): CookieOptions {
    const sameSite = this.pickSameSite(this.config.get<string>('REFRESH_SAMESITE'), this.isProd ? 'none' : 'lax');
    const maxAge = this.toNumber(this.config.get('JWT_REFRESH_MAX_AGE_MS'), 604_800_000);
    const opts: CookieOptions = {
      httpOnly: true,
      secure: this.useSecure,
      path: '/api/auth/refresh',
      sameSite,
      maxAge,
      ...(this.isProd ? { partitioned: true } : {}),
    };

    if (this.isProd) {
      const domain = this.config.get<string>('COOKIE_DOMAIN');
      if (domain) {
        opts.domain = domain;
      }
    }

    return opts;
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(this.accessCookieName, accessToken, this.buildAccessOpts());
    res.cookie(this.refreshCookieName, refreshToken, this.buildRefreshOpts());
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(this.accessCookieName, { ...this.buildAccessOpts(), maxAge: undefined });
    res.clearCookie(this.refreshCookieName, { ...this.buildRefreshOpts(), maxAge: undefined });
  }
}
