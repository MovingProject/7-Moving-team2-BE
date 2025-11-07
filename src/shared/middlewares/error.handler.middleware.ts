import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/http.exception';

export const errorHandler = (err: Error, req: Request, res: Response, _next?: NextFunction) => {
  if (res.headersSent) {
    console.error('Headers already sent, skipping errorHandler', err);
    return;
  }

  if (err instanceof HttpException) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.meta && { meta: err.meta }),
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: '예상치 못한 서버 에러가 발생했습니다.',
  });
};
