import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './domain/profile.repository';
import { PrismaService } from '../../infra/prisma.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
