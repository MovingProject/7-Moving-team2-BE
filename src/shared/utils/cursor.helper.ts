import { BadRequestException } from '@/shared/exceptions';

export interface LikedDriverCursorPayload {
  likedAt: string;
  id: string;
}

export type LikedDriversKey = { likedAt: Date; id: string };

const CURSOR_SEPARATOR = '|';

export function encodeLikedDriverCursor(payload: LikedDriverCursorPayload): string {
  const dataString = `${payload.likedAt}${CURSOR_SEPARATOR}${payload.id}`;
  return Buffer.from(dataString).toString('base64');
}

export function decodeLikedDriverCursor(encodedCursor: string): LikedDriverCursorPayload {
  let decodedString: string;
  try {
    decodedString = Buffer.from(encodedCursor, 'base64').toString('utf-8');
  } catch {
    throw new BadRequestException('Invalid cursor format.');
  }

  const parts = decodedString.split(CURSOR_SEPARATOR);
  if (parts.length !== 2) {
    throw new BadRequestException('Invalid cursor structure.');
  }

  const [likedAt, id] = parts;

  if (isNaN(new Date(likedAt).getTime())) {
    throw new BadRequestException('Invalid likedAt date in cursor.');
  }

  return { likedAt, id };
}
