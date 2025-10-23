import 'socket.io';

declare module 'socket.io' {
  interface SocketData {
    user?: { id: string; role: 'CONSUMER' | 'DRIVER'; jti?: string };
    tokenExp?: number;
  }
}
