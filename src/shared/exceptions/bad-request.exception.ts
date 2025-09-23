import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(message = '잘못된 요청입니다.') {
    super({ status: 400, code: 'BAD_REQUEST', message });
  }
}
