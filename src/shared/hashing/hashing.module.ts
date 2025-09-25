import { Module } from '@nestjs/common';
import { HASHING_SERVICE } from './hashing.service.interface';
import { BcryptHashingService } from '@/shared/hashing/bcrypt-hashing.service';

@Module({
  providers: [
    {
      provide: HASHING_SERVICE,
      useClass: BcryptHashingService,
    },
  ],
  exports: [HASHING_SERVICE],
})
export class HashingModule {}
