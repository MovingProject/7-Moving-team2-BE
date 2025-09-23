import { HttpException } from './http.exception';

export class ForbiddenException extends HttpException {
  constructor(message = '접근이 거부되었습니다.', meta?: Record<string, any>) {
    super({ status: 403, code: 'FORBIDDEN', message, meta });
  }
}
