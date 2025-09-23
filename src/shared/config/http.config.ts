import { registerAs } from '@nestjs/config';
import { parseOriginsSafe } from '@shared/utils/cors';

export default registerAs('http', () => ({
  corsOrigins: parseOriginsSafe(process.env.NEXT_URL, process.env.NEXT_PREVIEW_URL, process.env.EXTRA_ORIGINS),
  port: Number(process.env.PORT ?? 3000),
}));

export type HttpConfig = {
  port: number;
  corsOrigins: string[];
};
