import { HttpException } from './http.exception';

export class ConflictException extends HttpException {
  constructor(message = '리소스가 충돌했습니다.', meta?: Record<string, any>) {
    super({ status: 409, code: 'CONFLICT', message, meta });
  }
}
