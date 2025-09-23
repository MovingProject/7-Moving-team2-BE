import { HttpException } from './http.exception';

export class ConfigNotFoundException extends HttpException {
  constructor(message = '지정한 설정 파일을 찾을 수 없습니다.', meta?: Record<string, any>) {
    super({ status: 404, code: 'CONFIG_NOT_FOUND', message, meta });
  }
}
