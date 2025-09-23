import { HttpException } from './http.exception';

export class UnprocessableEntityException extends HttpException {
  constructor(message = '요청을 처리할 수 없습니다. (검증 실패)', meta?: Record<string, any>) {
    super({ status: 422, code: 'VALIDATION_FAILED', message, meta });
  }
}
