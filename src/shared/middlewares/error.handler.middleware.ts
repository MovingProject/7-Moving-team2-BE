import { HttpException } from '../exceptions/http.exception';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response) => {
  // 1. Zod 유효성 검사 에러 처리
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_FAILED',
      message: '유효성 검사 실패',
      errors: err.issues, // Zod 에러 상세 정보
    });
  }

  // 2. 우리가 정의한 HTTP 예외 클래스 처리
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      meta: err.meta,
      ...(err.meta && { meta: err.meta }),
    });
  }

  // 3. 그 외 예상치 못한 에러 처리
  console.error(err); // 서버 로그
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: '예상치 못한 서버 에러가 발생했습니다.',
  });
};
