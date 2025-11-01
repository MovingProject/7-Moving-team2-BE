import { encodeCursor, decodeCursor } from '@/shared/utils/cursor.utils';
import { BadRequestException } from '@/shared/exceptions';

export interface ChatCursorPayload {
  sequence: number;
}

export function encodeChatCursor(payload: ChatCursorPayload): string {
  const { sequence } = payload;
  if (sequence === undefined || sequence === null) {
    throw new BadRequestException('Invalid chat cursor payload.');
  }
  return encodeCursor(String(sequence));
}

export function decodeChatCursor(cursor: string): ChatCursorPayload {
  const decoded = decodeCursor(cursor);
  const num = Number(decoded);

  if (Number.isNaN(num)) {
    throw new BadRequestException('Invalid chat cursor structure.');
  }

  return { sequence: num };
}
