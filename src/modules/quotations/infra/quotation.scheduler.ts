import cron from 'node-cron';
import { IQuotationRepository } from '../interface/quotation.repository.interface';
import { QuotationStatus } from '@prisma/client';
import { ScheduledTask } from 'node_modules/node-cron/dist/esm/node-cron';

/**
 * moveAt 시간에 맞춰 quotation.status를 COMPLETED로 변경하는 스케줄 등록
 */

const registeredJobs = new Map<string, ScheduledTask>();

export async function scheduleQuotationCompletionJob(
  quotationId: string,
  moveAt: Date,
  quotationRepository: IQuotationRepository,
  status: QuotationStatus = QuotationStatus.COMPLETED,
) {
  const quotation = await quotationRepository.findById(quotationId);

  if (quotation?.status !== QuotationStatus.CONCLUDED) {
    return;
  }

  if (registeredJobs.has(quotationId)) {
    console.log(`⚠️ quotation ${quotationId} 이미 스케줄 등록됨`);
    return;
  }
  const cronTime = `${moveAt.getSeconds()} ${moveAt.getMinutes()} ${moveAt.getHours()} ${moveAt.getDate()} ${
    moveAt.getMonth() + 1
  } *`;

  console.log(`🕒 quotation ${quotationId} 스케줄 등록됨: ${cronTime}`);

  const job = cron.schedule(
    cronTime,
    async () => {
      const quotation = await quotationRepository.findById(quotationId);
      if (quotation?.status === QuotationStatus.CONCLUDED) {
        await quotationRepository.updateStatus(quotationId, QuotationStatus.COMPLETED);
      } else {
      }
      registeredJobs.delete(quotationId);
    },
    { timezone: 'Asia/Seoul' },
  );
  console.log(`현재 등록된 job 수: ${registeredJobs.size + 1}`);
  registeredJobs.set(quotationId, job);
}
