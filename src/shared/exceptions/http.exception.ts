export class HttpException extends Error {
  status: number;
  code: string;
  meta?: Record<string, any>;

  constructor(param: { status: number; code: string; message: string; meta?: Record<string, any> }) {
    const { status, code, message, meta } = param;
    super(message);
    this.status = status;
    this.code = code;
    this.meta = meta;
  }

  toResponse() {
    return {
      success: false,
      code: this.code,
      message: this.message,
      meta: this.meta,
    };
  }
}
