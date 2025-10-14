import { ForbiddenException, NotFoundException } from '@/shared/exceptions';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { TRANSACTION_RUNNER, type ITransactionRunner } from '@/shared/prisma/transaction-runner.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IDriverService } from './interface/driver.service.interface';
import {
  DRIVER_PROFILE_REPOSITORY,
  type IDriverProfileRepository,
} from './interface/driverProfile.repository.interface';
import { LIKE_REPOSITORY, type ILikeRepository } from './interface/like.repository.interface';
import { USER_REPOSITORY, type IUserRepository } from './interface/users.repository.interface';

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
  ) {}

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
