import { HttpException } from './http.exception';

export class ValidationFailedException extends HttpException {
  constructor(errors: Record<string, unknown>) {
    super({
      status: 400,
      code: 'VALIDATION_FAILED',
      message: '입력 값의 유효성 검사에 실패했습니다.',
      meta: { errors },
    });
  }
}
