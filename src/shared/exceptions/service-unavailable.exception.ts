import { HttpException } from './http.exception';

export class ServiceUnavailableException extends HttpException {
  constructor(message = '서비스를 일시적으로 사용할 수 없습니다.', meta?: Record<string, any>) {
    super({ status: 503, code: 'SERVICE_UNAVAILABLE', message, meta });
  }
}
