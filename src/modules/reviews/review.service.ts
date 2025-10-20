import { Injectable } from '@nestjs/common';
import { IReviewService } from './interface/review-service.interface';

@Injectable()
export class ReviewService implements IReviewService {}
