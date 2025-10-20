import { ConflictException, ForbiddenException, NotFoundException } from '@/shared/exceptions';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { TRANSACTION_RUNNER, type ITransactionRunner } from '@/shared/prisma/transaction-runner.interface';
import { decodeDriverCursor, encodeDriverCursor } from '@/shared/utils/driver.cursor.helper';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SORT_FIELD_MAP } from './domain/driver-sort.helper';
import { CreateDriverProfileBody } from './dto/createDriverProfileBodySchema';
import { GetDriverListQuery } from './dto/getDriverListQuerySchema';
import { IDriverService } from './interface/driver.service.interface';
import {
  DRIVER_PROFILE_REPOSITORY,
  RepoFindDriversInput,
  type IDriverProfileRepository,
} from './interface/driverProfile.repository.interface';
import { LIKE_REPOSITORY, type ILikeRepository } from './interface/like.repository.interface';
import { USER_REPOSITORY, type IUserRepository } from './interface/users.repository.interface';
import { DriverSortType } from '@/shared/constant/values';
import { type IInviteRepository, INVITE_REPOSITORY } from '../requests/interface/invite.repository.interface';
import { toDriverListItem } from './domain/driver.mapper';

@Injectable()
export default class DriverService implements IDriverService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: ITransactionRunner,
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: ILikeRepository,
    @Inject(DRIVER_PROFILE_REPOSITORY)
    private readonly driverProfileRepository: IDriverProfileRepository,
    @Inject(INVITE_REPOSITORY)
    private readonly inviteRepository: IInviteRepository,
  ) {}

  async getDrivers(user: AccessTokenPayload | null, query: GetDriverListQuery) {
    const { area, type, sort, take, cursor } = query;
    const sortField = SORT_FIELD_MAP[sort];

    let cursorPrimaryNumeric: number | undefined;
    let cursorId: string | undefined;

    if (cursor) {
      const payload = decodeDriverCursor(cursor);
      if (payload.sort !== sort) {
        throw new BadRequestException('Cursor sort does not match current sort.');
      }

      const rawPrimary = payload.primary.trim();
      cursorPrimaryNumeric = Number(rawPrimary);
      cursorId = payload.id;
    }

    const repoInput: RepoFindDriversInput = {
      area,
      type,
      sortField,
      cursorPrimary: cursorPrimaryNumeric,
      cursorId,
      takePlusOne: Number(take) + 1,
    };

    const aggregates = await this.driverProfileRepository.findDrivers(repoInput);

    const hasNext = aggregates.length > take;
    const page = hasNext ? aggregates.slice(0, take) : aggregates;

    let nextCursor: string | null = null;
    if (hasNext && page.length > 0) {
      const sortKey = sort;
      const cursorSortField = SORT_FIELD_MAP[sortKey];
      const last = page[page.length - 1];
      const primaryValue = last[cursorSortField];
      nextCursor = encodeDriverCursor({
        sort: sortKey,
        primary: String(primaryValue),
        id: last.userId,
      });
    }

    let invitedSet = new Set<string>();

    if (user?.role === 'CONSUMER' && page.length > 0) {
      const driverIds = Array.from(new Set(page.map((r) => r.userId)));
      invitedSet = await this.inviteRepository.findInvitedDriverIds(user.sub, driverIds);
    }

    const items = page.map((r) => toDriverListItem(r, invitedSet.has(r.userId)));

    return {
      items: items,
      nextCursor,
      hasNext,
    };
  }

  async createDriverProfile(driverId: string, body: CreateDriverProfileBody) {
    const existingDriver = await this.userRepository.findById(driverId);

    if (!existingDriver) {
      throw new NotFoundException('Driver not found');
    }

    if (existingDriver.driverProfile) {
      throw new ConflictException('이미 등록된 프로필입니다.');
    }

    try {
      return await this.driverProfileRepository.createDriverProfile(driverId, body);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') {
          throw new ConflictException('이미 등록된 프로필입니다.');
        }
      }
      throw error;
    }
  }

  async likeDriver(driverId: string, user: AccessTokenPayload) {
    const consumerId = user.sub;
    const existingConsumer = await this.userRepository.findById(consumerId);
    if (!existingConsumer) {
      throw new NotFoundException('User not found');
    }

    const existingDriver = await this.userRepository.findById(driverId);
    if (!existingDriver) {
      throw new NotFoundException('Driver not found');
    }

    if (!existingDriver.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    if (existingDriver.role !== 'DRIVER') {
      throw new ForbiddenException('User is not a driver');
    }

    const result = await this.transactionRunner.run(async (ctx) => {
      const created = await this.likeRepository.insertIfAbsent(consumerId, driverId, ctx);
      if (created) {
        await this.driverProfileRepository.incrementLikeCount(driverId, ctx);
        return { liked: true } as const;
      }

      return { liked: false, message: 'Already liked' } as const;
    });

    return result;
  }

  async unlikeDriver(driverId: string, user: AccessTokenPayload) {
    const consumerId = user.sub;
    const existingConsumer = await this.userRepository.findById(consumerId);
    if (!existingConsumer) {
      throw new NotFoundException('User not found');
    }

    const existingDriver = await this.userRepository.findById(driverId);
    if (!existingDriver) {
      throw new NotFoundException('Driver not found');
    }

    if (!existingDriver.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    if (existingDriver.role !== 'DRIVER') {
      throw new ForbiddenException('User is not a driver');
    }

    const result = await this.transactionRunner.run(async (ctx) => {
      const deleted = await this.likeRepository.deleteIfExists(consumerId, driverId, ctx);
      if (deleted) {
        await this.driverProfileRepository.decrementLikeCount(driverId, ctx);
        return { unliked: true } as const;
      }

      return { unliked: false, message: 'Already unliked' } as const;
    });

    return result;
  }
}
