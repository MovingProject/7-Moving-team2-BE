import { HttpException } from './http.exception';

export class ConfigNotFoundException extends HttpException {
  constructor(message = 'configuration이 존재하지 않습니다.', meta?: Record<string, any>) {
    super({ status: 400, code: 'BAD_REQUEST', message, meta });
  }
}
