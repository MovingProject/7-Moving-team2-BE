export const WS_EVENTS = {
  CONN_OK: 'conn:ok',
  ERROR: 'error:event',
  CHAT_JOIN: 'chat:join',
  CHAT_JOINED: 'chat:joined',
  CHAT_SEND: 'chat:send',
  CHAT_CREATED: 'chat:created',
  CHAT_NEW: 'chat:new',
  CHAT_READ: 'chat:read',
  CHAT_READ_OK: 'chat:read:ok',
} as const;
