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

@Controller('Notifications')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

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
}
