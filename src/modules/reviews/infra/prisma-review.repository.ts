import { Injectable } from '@nestjs/common';
import { IReviewRepository } from '../interface/review-repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}
}
