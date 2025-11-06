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
  isTestMode = false,
) {
  const quotation = await quotationRepository.findById(quotationId);
  if (quotation?.status !== QuotationStatus.CONCLUDED) return;

  if (registeredJobs.has(quotationId)) {
    console.log(`⚠️ quotation ${quotationId} 이미 스케줄 등록됨`);
    return;
  }

  const targetDate = isTestMode ? new Date(Date.now() + 10 * 1000) : moveAt;

  const cronTime = `${targetDate.getSeconds()} ${targetDate.getMinutes()} ${targetDate.getHours()} ${targetDate.getDate()} ${
    targetDate.getMonth() + 1
  } *`;

  console.log(`🕒 quotation ${quotationId} 스케줄 등록됨: ${cronTime} ${isTestMode ? '(테스트 모드)' : ''}`);

  const job = cron.schedule(
    cronTime,
    async () => {
      const quotation = await quotationRepository.findById(quotationId);
      if (quotation?.status === QuotationStatus.CONCLUDED) {
        await quotationRepository.updateStatus(quotationId, QuotationStatus.COMPLETED);
        console.log(`✅ quotation ${quotationId} 완료됨 (${isTestMode ? '테스트' : '실제'})`);
      }
      registeredJobs.delete(quotationId);
    },
    { timezone: 'Asia/Seoul' },
  );

  console.log(`현재 등록된 job 수: ${registeredJobs.size + 1}`);
  registeredJobs.set(quotationId, job);
}
