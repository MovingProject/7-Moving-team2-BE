import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Controller, Delete, HttpCode, HttpStatus, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { driverIdParamSchema, type DriverIdParam } from './dto/driverIdParamSchema';
import { DRIVER_SERVICE, type IDriverService } from './interface/driver.service.interface';

@ApiTags('Driver')
@Controller('drivers')
export class DriverController {
  constructor(@Inject(DRIVER_SERVICE) private readonly driverService: IDriverService) {}

  @Post(':driverId/likes')
  @ApiOperation({ summary: '드라이버 좋아요' })
  @ApiParam({ name: 'driverId', type: 'string', format: 'uuid', required: true, description: 'Driver user ID' })
  @ApiResponse({ status: 200, description: '드라이버 좋아요 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async likeDriver(
    @Param(new ZodValidationPipe(driverIdParamSchema)) params: DriverIdParam,
    @AuthUser() user: AccessTokenPayload,
  ) {
    return this.driverService.likeDriver(params.driverId, user);
  }

  @Delete(':driverId/likes')
  @ApiOperation({ summary: '드라이버 좋아요 취소' })
  @ApiParam({ name: 'driverId', type: 'string', format: 'uuid', required: true, description: 'Driver user ID' })
  @ApiResponse({ status: 200, description: '드라이버 좋아요 취소 성공' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async unlikeDriver(
    @Param(new ZodValidationPipe(driverIdParamSchema)) params: DriverIdParam,
    @AuthUser() user: AccessTokenPayload,
  ) {
    return this.driverService.unlikeDriver(params.driverId, user);
  }
}
