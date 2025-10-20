import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser, AuthUserOptional } from '../auth/decorators/auth-user.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CreateDriverProfileBodyDto, createDriverProfileBodySchema } from './dto/createDriverProfileBodySchema';
import { driverIdParamSchema, type DriverIdParam } from './dto/driverIdParamSchema';
import { DRIVER_SERVICE, type IDriverService } from './interface/driver.service.interface';
import { GetDriverListQuerySchema, type GetDriverListQuery } from './dto/getDriverListQuerySchema';
import { OptionalAccessTokenGuard } from '../auth/guards/optionalAccessToken.guard';

@ApiTags('Driver')
@Controller('drivers')
export class DriverController {
  constructor(@Inject(DRIVER_SERVICE) private readonly driverService: IDriverService) {}

  @Get()
  @ApiOperation({ summary: '드라이버 목록 조회' })
  @ApiResponse({ status: 200, description: '드라이버 목록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 쿼리 파라미터' })
  @UseGuards(OptionalAccessTokenGuard)
  async getDrivers(
    @AuthUserOptional() user: AccessTokenPayload | null,
    @Query(new ZodValidationPipe(GetDriverListQuerySchema)) query: GetDriverListQuery,
  ) {
    return this.driverService.getDrivers(user, query);
  }

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
