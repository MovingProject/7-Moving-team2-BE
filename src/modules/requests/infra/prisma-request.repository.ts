import { Prisma, Request } from '@prisma/client';
import { IRequestRepository } from '../interface/request.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConflictException } from '@/shared/exceptions';
import { CreateRequestData, RequestEntity } from '../types';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { getDb } from '@/shared/prisma/get-db';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

import { ReceivedRequestFilter } from '../dto/request-filter-post.dto';
@Injectable()
export class PrismaRequestRepository implements IRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPendingByConsumerId(consumerId: string, ctx?: TransactionContext): Promise<RequestEntity | null> {
    const db = getDb(ctx, this.prisma);
    const row = await db.request.findFirst({
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
        throw new ConflictException(
          '이미 진행중인 요청이 있습니다. 기존 요청을 완료하거나 취소한 뒤 다시 시도해주세요.',
        );
      }
      throw e;
    }
  }

  async findInvitesByDriverId(driverId: string): Promise<ReceivedRequest[]> {
    const area = await this.prisma.driverServiceArea.findMany({
      where: { driverProfile: { driver: { id: driverId } } },
      select: { serviceArea: true },
    });

    const serviceArea = area.map((e) => e.serviceArea);

    //일반견적조회
    const requests = await this.prisma.request.findMany({
      where: {
        OR: [
          { invites: { some: { driverId } } },
          {
            invites: { none: { driverId } },
            OR: [{ departureArea: { in: serviceArea } }, { arrivalArea: { in: serviceArea } }],
          },
        ],
      },
      include: {
        consumer: { select: { name: true } },
        invites: { where: { driverId } },
      },
      orderBy: [{ invites: { _count: 'desc' } }, { createdAt: 'desc' }],
    });
    return requests.map((req) => ({
      id: req.id,
      consumerName: req.consumer.name,
      moveAt: req.moveAt,
      departureAddress: req.departureAddress,
      arrivalAddress: req.arrivalAddress,
      serviceType: req.serviceType,
      createdAt: req.createdAt,
      isInvited: req.invites.length > 0,
    }));
  }

  async incrementInvitedCountIfAvailable(requestId: string, ctx?: TransactionContext): Promise<boolean> {
    const db = getDb(ctx, this.prisma);
    const affected = await db.$executeRawUnsafe<number>(
      `
      UPDATE "Request"
      SET "invitedQuoteCount" = "invitedQuoteCount" + 1
      WHERE "id" = $1 AND "invitedQuoteCount" < "invitedQuoteLimit"
      `,
      requestId,
    );
    return affected === 1; // 1행 갱신되면 성공, 0이면 한도 초과
  }
  async filterRequests(driverId: string, filter: ReceivedRequestFilter) {
    console.log('레포지토리: ', filter);
    // driver의 서비스 지역 조회
    const driverAreas = await this.prisma.driverServiceArea.findMany({
      where: { driverProfile: { driver: { id: driverId } } },
      select: { serviceArea: true },
    });
    console.log('기사님 서비스지역 : ', driverAreas);
    const serviceAreas = driverAreas.map((a) => a.serviceArea);

    // 요청 조회 (지정 + 일반 + 필터)
    const requests = await this.prisma.request.findMany({
      where: {
        // 지정견적 필터
        ...(filter.isInvited === true
          ? { invites: { some: { driverId } } }
          : filter.isInvited === false
            ? { invites: { none: { driverId } } }
            : {}),

        // 지역 필터 (지정/일반 상관없이 둘 다 가능)
        OR: filter.areas?.length
          ? [
              { departureArea: { in: filter.areas ?? serviceAreas } },
              // { arrivalArea: { in: filter.areas ?? serviceAreas } },
            ]
          : undefined,

        serviceType: filter.serviceTypes ? { in: filter.serviceTypes } : undefined,
        moveAt:
          filter.moveAtFrom || filter.moveAtTo
            ? {
                gte: filter.moveAtFrom ? new Date(filter.moveAtFrom) : undefined,
                lte: filter.moveAtTo ? new Date(filter.moveAtTo) : undefined,
              }
            : undefined,
        consumer: filter.consumerName
          ? {
              name: { contains: filter.consumerName, mode: 'insensitive' },
            }
          : undefined,
      },
      include: {
        consumer: { select: { name: true } },
        invites: { where: { driverId } },
      },
      orderBy: [{ invites: { _count: 'desc' } }, { createdAt: 'desc' }],
    });

    // DTO 변환
    return requests.map((req) => ({
      id: req.id,
      consumerName: req.consumer.name,
      moveAt: req.moveAt,
      departureAddress: req.departureAddress,
      arrivalAddress: req.arrivalAddress,
      serviceType: req.serviceType,
      createdAt: req.createdAt,
      isInvited: req.invites.length > 0,
    }));
  }
}
