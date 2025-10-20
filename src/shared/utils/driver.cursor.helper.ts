import { BadRequestException } from '@/shared/exceptions';

export interface DriverCursorPayload {
  sort: 'REVIEW_DESC' | 'RATING_DESC' | 'CAREER_DESC' | 'CONFIRMED_DESC';
  primary: string; // 정렬 기준 값 (문자열로 고정)
  id: string; // tie-breaker (userId)
}

const CURSOR_SEPARATOR = '|';
const SORT_VALUES = ['REVIEW_DESC', 'RATING_DESC', 'CAREER_DESC', 'CONFIRMED_DESC'] as const;

export function encodeDriverCursor(payload: DriverCursorPayload): string {
  if (payload.primary.includes(CURSOR_SEPARATOR) || payload.id.includes(CURSOR_SEPARATOR)) {
    throw new BadRequestException('Cursor value contains illegal separator.');
  }

  const dataString = `${payload.sort}${CURSOR_SEPARATOR}${payload.primary}${CURSOR_SEPARATOR}${payload.id}`;
  return Buffer.from(dataString, 'utf-8').toString('base64');
}

export function decodeDriverCursor(encodedCursor: string): DriverCursorPayload {
  if (!encodedCursor || typeof encodedCursor !== 'string') {
    throw new BadRequestException('Invalid cursor format.');
  }

  // base64 디코드
  let decodedString: string;
  try {
    decodedString = Buffer.from(encodedCursor, 'base64').toString('utf-8');
  } catch {
    throw new BadRequestException('Invalid cursor format.');
  }

  if (Buffer.from(decodedString, 'utf-8').toString('base64') !== encodedCursor) {
    throw new BadRequestException('Invalid cursor format.');
  }

  const parts = decodedString.split(CURSOR_SEPARATOR);
  if (parts.length !== 3) {
    throw new BadRequestException('Invalid cursor structure.');
  }

  const [sort, primary, id] = parts.map((v) => v.trim());

  if (!SORT_VALUES.includes(sort as (typeof SORT_VALUES)[number])) {
    throw new BadRequestException('Invalid sort value in cursor.');
  }
  if (!primary) {
    throw new BadRequestException('Invalid primary value in cursor.');
  }
  if (!id) {
    throw new BadRequestException('Invalid id value in cursor.');
  }

  return { sort: sort as DriverCursorPayload['sort'], primary, id };
}
