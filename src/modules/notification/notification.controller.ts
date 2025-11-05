import { Controller, Inject, Query, Get } from '@nestjs/common';
import { NOTIFICATION_SERVICE, type INotificationService } from './interface/notification.service.interface';
import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { GetNotificationsQueryDto } from './interface/dto/get-notifications.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { getNotificationsQuerySchema } from './interface/dto/get-notifications.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Param, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import type { MarkReadDto } from './dto/notifications.dto';

@Controller('Notifications')
@UseGuards(AccessTokenGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '알림 조회' })
  @ApiResponse({ status: 200, description: '알림 조회 성공' })
  async getNotifications(
    @AuthUser() user: AccessTokenPayload,
    @Query(new ZodValidationPipe(getNotificationsQuerySchema)) query: GetNotificationsQueryDto,
  ) {
    return this.notificationService.getNotifications(user.sub, query);
  }

  @Get('getall')
  async getAll(@AuthUser() user: AccessTokenPayload) {
    return this.notificationService.getAllByUser(user.sub);
  }

  @Get(':id')
  async getOne(@AuthUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.notificationService.getOneById(user.sub, id);
  }

  @Post('read')
  async markRead(@AuthUser() user: AccessTokenPayload, @Body() dto: MarkReadDto) {
    return this.notificationService.markRead(user.sub, dto.ids);
  }
  @Post('readAll')
  async markAll(@AuthUser() user: AccessTokenPayload) {
    return this.notificationService.markAllRead(user.sub);
  }
  @Post('totalread')
  async totalMarkRead(@AuthUser() user: AccessTokenPayload, @Body() body?: { ids?: string[] }) {
    return this.notificationService.markAsRead(user.sub, body?.ids);
  }
}
