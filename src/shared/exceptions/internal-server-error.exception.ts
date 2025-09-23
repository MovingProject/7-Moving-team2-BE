import { HttpException } from './http.exception';

export class InternalServerException extends HttpException {
  constructor(message = '서버 내부 오류가 발생했습니다.', meta?: Record<string, any>) {
    super({ status: 500, code: 'INTERNAL_ERROR', message, meta });
  }
}
