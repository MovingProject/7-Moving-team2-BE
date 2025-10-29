import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(`✅ Request success: ${Date.now() - now}ms`);
      }),
      catchError((error) => {
        if (error instanceof AxiosError) {
          console.error(`❌ AxiosError: [${error.response?.status}] ${error.message}`);
        } else {
          console.error(`❌ Unknown Error: ${error.message}`);
        }
        return throwError(() => error);
      }),
    );
  }
}
