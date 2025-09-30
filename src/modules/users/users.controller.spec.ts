// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UserDtoFactory } from './dto/user.response.dto';
import { MoveType, Area } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockConsumerUser = {
    id: 'user-consumer-1',
    name: '홍길동',
    email: 'hong@test.com',
    phoneNumber: '010-1111-2222',
    role: 'CONSUMER' as const,
    passwordHash: null,
    providerId: null,
    provider: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    driverProfile: null,
    consumerProfile: {
      id: 'consumer-profile-1',
      consumerId: 'user-consumer-1',
      image: null,
      serviceType: MoveType.SMALL_MOVE, // enum으로 맞춤
      areas: Area.SEOUL, // enum으로 맞춤
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };

  const mockDriverUser = {
    id: 'user-driver-1',
    name: '김기사',
    email: 'kim@test.com',
    phoneNumber: '010-3333-4444',
    role: 'DRIVER' as const,
    providerId: null,
    provider: null,
    passwordHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    driverProfile: {
      id: 'driver-profile-1',
      userId: 'user-driver-1',
      image: null,
      nickname: '김기사',
      careerYears: '5년',
      oneLiner: '안전하게 배달합니다',
      description: '세부 설명',
      rating: 0,
      reviewCount: 0,
      confirmedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      driverServiceTypes: [{ serviceType: 'SMALL_MOVE' }, { serviceType: 'HOME_MOVE' }],
      driverServiceAreas: [{ serviceArea: 'SEOUL' }, { serviceArea: 'GYEONGGI' }],
    },
    consumerProfile: null,
  };

  const mockUserNotFound = {
    id: 'user-none',
    name: '없는유저',
    email: 'none@test.com',
    driverProfile: null,
    consumerProfile: null,
  };

  const mockUsersService = {
    getUserWithProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('ConsumerProfile 있을 때 DTO 반환', async () => {
    mockUsersService.getUserWithProfile.mockResolvedValue(mockConsumerUser);
    const result = await controller.getProfile('user-consumer-1');
    expect(result).toEqual(UserDtoFactory.toEditConsumerProfileDto(mockConsumerUser, mockConsumerUser.consumerProfile));
  });

  it('DriverProfile 있을 때 DTO 반환', async () => {
    mockUsersService.getUserWithProfile.mockResolvedValue(mockDriverUser);
    const result = await controller.getProfile('user-driver-1');
    expect(result).toEqual(
      UserDtoFactory.toEditDriverProfileDto(
        mockDriverUser,
        mockDriverUser.driverProfile,
        mockDriverUser.driverProfile.driverServiceTypes.map((t) => t.serviceType),
        mockDriverUser.driverProfile.driverServiceAreas.map((a) => a.serviceArea),
      ),
    );
  });

  it('ConsumerProfile, DriverProfile 모두 없으면 NotFoundException 발생', async () => {
    mockUsersService.getUserWithProfile.mockResolvedValue(mockUserNotFound);
    await expect(controller.getProfile('user-none')).rejects.toThrow(NotFoundException);
  });
});
