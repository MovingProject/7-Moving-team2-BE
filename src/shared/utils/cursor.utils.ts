import { BadRequestException } from '@/shared/exceptions';

/**
 * 커서를 안전하게 base64 인코딩
 */
export function encodeCursor(raw: string): string {
  if (!raw) throw new BadRequestException('Cannot encode empty cursor.');
  return Buffer.from(raw, 'utf-8').toString('base64');
}

/**
 * base64 커서를 안전하게 디코딩 (검증 포함)
 */
export function decodeCursor(encoded: string): string {
  if (!encoded || typeof encoded !== 'string') {
    throw new BadRequestException('Invalid cursor format.');
  }

  let decoded: string;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    throw new BadRequestException('Invalid cursor format.');
  }

  // 재검증 (악의적 인코딩 방지)
  if (Buffer.from(decoded, 'utf-8').toString('base64') !== encoded) {
    throw new BadRequestException('Invalid cursor format.');
  }

  return decoded;
}
