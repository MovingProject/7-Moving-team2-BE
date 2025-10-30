export type Ack<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      code: string;
      message?: string;
      meta?: Record<string, unknown>;
    };

export const ok = <T>(data: T): Ack<T> => ({ ok: true, data });
export const fail = (code: string, message?: string, meta?: Record<string, unknown>): Ack<never> => ({
  ok: false,
  code,
  message,
  meta,
});
