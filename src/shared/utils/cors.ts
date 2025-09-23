import { URL } from 'url';
import { ConfigNotFoundException } from '../exceptions/config-not-found.exception';

export function parseOriginsSafe(...originEnvValues: Array<string | undefined>): string[] {
  const normalizedOrigins = new Set<string>();

  for (const originEnvValue of originEnvValues) {
    if (!originEnvValue) continue;

    const originCandidates = originEnvValue.split(',');

    for (const originCandidate of originCandidates) {
      const trimmedCandidate = originCandidate.trim();
      if (!trimmedCandidate) continue;

      try {
        const parsedUrl = new URL(trimmedCandidate);
        const normalizedOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;
        normalizedOrigins.add(normalizedOrigin);
      } catch (error: unknown) {
        throw new ConfigNotFoundException(
          `CORS_ORIGINS 환경변수에 유효하지 않은 URL '${trimmedCandidate}'이 포함되어 있습니다.`,
          {
            error: error instanceof Error ? error.message : String(error),
            invalidUrl: trimmedCandidate,
          },
        );
      }
    }
  }

  return Array.from(normalizedOrigins);
}
