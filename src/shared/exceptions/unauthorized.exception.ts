import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(message = '인증이 필요합니다.', meta?: Record<string, any>) {
    super({ status: 401, code: 'AUTH_REQUIRED', message, meta });
  }
}
