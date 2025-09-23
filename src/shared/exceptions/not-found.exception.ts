import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(message = '리소스를 찾을 수 없습니다.', meta?: Record<string, any>) {
    super({ status: 404, code: 'NOT_FOUND', message, meta });
  }
}
