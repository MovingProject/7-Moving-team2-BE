import cron from 'node-cron';
import { IQuotationRepository } from '../interface/quotation.repository.interface';
import { QuotationStatus } from '@prisma/client';

/**
 * moveAt 시간에 맞춰 quotation.status를 COMPLETED로 변경하는 스케줄 등록
 */
export function scheduleQuotationCompletionJob(
  quotationId: string,
  moveAt: Date,
  quotationRepository: IQuotationRepository,
  status: QuotationStatus = QuotationStatus.COMPLETED,
) {
  const cronTime = `${moveAt.getSeconds()} ${moveAt.getMinutes()} ${moveAt.getHours()} ${moveAt.getDate()} ${
    moveAt.getMonth() + 1
  } *`;

  cron.schedule(
    cronTime,
    async () => {
      const quotation = await quotationRepository.findById(quotationId);
      if (quotation?.status === QuotationStatus.CONCLUDED) {
        await quotationRepository.updateStatus(quotationId, QuotationStatus.COMPLETED);
      } else {
      }
    },
    { timezone: 'Asia/Seoul' },
  );
}
