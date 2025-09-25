import { RoleSchema } from '@/shared/constant/enums.schema';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
export const signInSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    .max(20, { message: '비밀번호는 최대 20자 이하이어야 합니다.' }),
  role: RoleSchema,
});

export type SignInRequest = z.infer<typeof signInSchema>;
export class SignInRequestDto extends createZodDto(signInSchema) {}
