import { z } from 'zod';
import { RoleSchema } from '@/shared/constant/enums.schema';

export const signUpSchema = z
  .object({
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
    password: z
      .string()
      .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
      .max(20, { message: '비밀번호는 최대 20자 이하이어야 합니다.' }),
    passwordConfirm: z.string(),
    name: z.string().min(2, { message: '이름은 2글자 이상이어야 합니다.' }),
    phoneNumber: z
      .string()
      .regex(/^010-\d{4}-\d{4}$/, { message: '전화번호 형식이 올바르지 않습니다. (010-1234-5678)' }),
    role: RoleSchema,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
