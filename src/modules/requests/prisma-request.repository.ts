import { Prisma, Request } from '@prisma/client';
import { IRequestRepository } from './interface/request.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PendingRequestConflictError } from './interface/errors';
import { CreateRequestData, RequestEntity } from './types';

@Injectable()
export class PrismaRequestRepository implements IRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPendingByConsumerId(consumerId: string): Promise<RequestEntity | null> {
    const row = await this.prisma.request.findFirst({
      where: { consumerId, requestStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return row ?? null;
  }

  async createRequest(data: CreateRequestData): Promise<RequestEntity> {
    try {
      const created = await this.prisma.request.create({
        data: {
          serviceType: data.serviceType,
          moveAt: data.moveAt,
          departureAddress: data.departureAddress,
          departureFloor: data.departureFloor,
          departurePyeong: data.departurePyeong,
          departureElevator: data.departureElevator,
          arrivalAddress: data.arrivalAddress,
          arrivalFloor: data.arrivalFloor,
          arrivalPyeong: data.arrivalPyeong,
          arrivalElevator: data.arrivalElevator,
          additionalRequirements: data.additionalRequirements,
          departureArea: data.departureArea,
          arrivalArea: data.arrivalArea,
          consumer: { connect: { id: data.consumerId } },
        },
      });
      return created;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // 옵션: e.meta?.target으로 특정 인덱스 식별 가능
        throw new PendingRequestConflictError();
      }
      throw e;
    }
  }
}
