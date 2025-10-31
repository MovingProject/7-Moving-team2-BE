import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';

export type C2S = {
  'chat:join': (p: { roomId: string }) => void;
  'chat:send': (p: { roomId: string; tempId: string; body: string }) => void;
  'chat:read': (p: { roomId: string; lastReadIdx: number }) => void;
};

// Client to Server (서버 -> 클라이언트로 보내는 이벤트 시그니처)
export type S2C = {
  'conn:ok': (p: { userId: string; role: 'CONSUMER' | 'DRIVER' }) => void;
  'error:event': (p: { code: string; message: string }) => void;
  'chat:new': (p: {
    roomId: string;
    msg:
      | {
          id: string;
          idx: number;
          authorId: string;
          messageType: 'MESSAGE';
          body: string; // 메시지일 때만 존재
          sentAt: string;
          tempId: string;
        }
      | {
          id: string;
          idx: number;
          authorId: string;
          messageType: 'QUOTATION';
          quotationId: string; // 견적일 때만 존재
          sentAt: string;
          tempId: string;
        };
  }) => void;
};

// Internal Server Event (서버 내부에서 사용하는 이벤트 시그니처)
export type ISE = Record<string, never>;

// Socket Data (소켓에 붙여 보관하는 추가 데이터)
export type SD = { user?: { id: string; role: 'CONSUMER' | 'DRIVER'; jti?: string }; tokenExp?: number };

export type WsServer = import('socket.io').Server<C2S, S2C, ISE, SD>;
export type WsSocket = import('socket.io').Socket<C2S, S2C, ISE, SD>;

export type JwtAccess = AccessTokenPayload & {
  sub: string;
  role: 'CONSUMER' | 'DRIVER';
  jti?: string;
  exp: number;
};

export type SocketUser = { id: string; role: 'CONSUMER' | 'DRIVER'; jti?: string };
