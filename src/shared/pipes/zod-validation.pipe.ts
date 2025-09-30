import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { ValidationFailedException } from '../exceptions/validation.exception';

@Injectable()
export class ZodValidationPipe<T extends z.ZodType, U = z.infer<T>> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown, _metadata: ArgumentMetadata): U {
    try {
      const parsedValue = this.schema.parse(value) as U;
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
