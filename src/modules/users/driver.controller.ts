import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Delete, HttpCode, HttpStatus, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CreateDriverProfileBodyDto, createDriverProfileBodySchema } from './dto/createDriverProfileBodySchema';
import { driverIdParamSchema, type DriverIdParam } from './dto/driverIdParamSchema';
import { DRIVER_SERVICE, type IDriverService } from './interface/driver.service.interface';

@ApiTags('Driver')
@Controller('drivers')
export class DriverController {
  constructor(@Inject(DRIVER_SERVICE) private readonly driverService: IDriverService) {}

  @Post('profile')
  @ApiOperation({ summary: '드라이버 프로필 등록' })
  @ApiResponse({ status: 201, description: '드라이버 프로필 등록 성공' })
  @ApiResponse({ status: 401, description: '미인증' })
  @ApiResponse({ status: 403, description: '권한 불일치' })
  @ApiResponse({ status: 409, description: '이미 등록된 프로필' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('DRIVER')
  async createDriverProfile(
    @AuthUser() user: AccessTokenPayload,
    @Body(new ZodValidationPipe(createDriverProfileBodySchema)) body: CreateDriverProfileBodyDto,
  ) {
    return this.driverService.createDriverProfile(user.sub, body);
  }

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
