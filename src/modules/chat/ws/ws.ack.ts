export type Ack<T = unknown> = { ok: true; data: T } | { ok: false; code: string; message?: string };
export const ok = <T>(data: T): Ack<T> => ({ ok: true, data });
export const fail = (code: string, message?: string): Ack<never> => ({ ok: false, code, message }); // Server to Client (클라이언트 -> 서버로 보내는 이벤트 시그니처)
