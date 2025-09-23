import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { z } from 'zod';
import { ValidationFailedException } from '../exceptions/validation.exception';

// 1. 클래스에 제네릭 <T extends z.ZodType> 추가
@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  // 2. 생성자에서 받는 schema의 타입을 제네릭 T로 변경
  constructor(private schema: T) {}

  // 3. transform 메서드의 반환 타입을 z.infer<T>로 명시
  transform(value: unknown, _metadata: ArgumentMetadata): z.infer<T> {
    try {
      // 이제 parsedValue는 'any'가 아닌, 스키마로부터 추론된 정확한 타입을 가집니다.
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.flatten().fieldErrors;
        throw new ValidationFailedException(errorMessages);
      }

      throw error;
    }
  }
}
