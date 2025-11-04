import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { DriverIdParamDto, driverIdParamSchema } from '../users/dto/driverIdParamSchema';
import { CreateQuoteRequestBodyDto, createQuoteRequestBodySchema } from './dto/create-quote-request.dto';
import { type IRequestService, REQUEST_SERVICE } from './interface/request.service.interface';

import { RolesGuard } from '../auth/guards/role.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { type ReceivedRequestFilter } from './dto/request-filter-post.dto';
import { type DriverRequestActionDTO } from './dto/request-reject-request-received.dto';
@ApiTags('견적 요청 (Request)')
@Controller('requests')
export class RequestController {
  constructor(@Inject(REQUEST_SERVICE) private readonly requestService: IRequestService) {}

  @Post()
  @ApiOperation({ summary: '견적 요청서 생성' })
  @ApiResponse({ status: 201, description: '견적 요청서 생성 완료' })
  @UseGuards(AccessTokenGuard)
  async createQuoteRequest(
    @Body(new ZodValidationPipe(createQuoteRequestBodySchema)) body: CreateQuoteRequestBodyDto,
    @AuthUser() user: AccessTokenPayload,
  ) {
    return this.requestService.createQuoteRequest(body, user);
  }

  @Get('received')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('DRIVER')
  async getReceivedRequests(@Req() req) {
    const driverId = req.user.sub;
    return this.requestService.findReceivedByDriverId(driverId);
  }

  @Post('/invite/:driverId')
  @ApiOperation({ summary: '지정 견적 요청하기' })
  @ApiParam({ name: 'driverId', description: '기사 ID(UUID)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async inviteToRequest(
    @Param(new ZodValidationPipe(driverIdParamSchema)) param: DriverIdParamDto,
    @AuthUser() user: AccessTokenPayload,
  ) {
    return this.requestService.inviteToRequest(param.driverId, user);
  }
  @Post('received/search')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('DRIVER')
  async filterReceivedRequests(@Req() req, @Body() filter: ReceivedRequestFilter) {
    const driverId = req.user.sub;
    console.log('filter received(컨트롤):', filter);
    return this.requestService.filterReceivedRequests(driverId, filter);
  }

  @UseGuards(AccessTokenGuard)
  @Get('count')
  async getCounts(@Req() req: any) {
    const driverId = req.user.sub; // 로그인한 기사 ID
    return this.requestService.countRequests(driverId);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('DRIVER')
  @Post('reject')
  async rejectRequest(@Body() dto: DriverRequestActionDTO, @AuthUser() user: AccessTokenPayload) {
    return this.requestService.rejectRequest(user.sub, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  @Get('list')
  async requestList(@AuthUser() user: AccessTokenPayload) {
    return this.requestService.getConsumerRequests(user.sub);
  }
  @Get('check')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async checkRequest(@AuthUser() user: AccessTokenPayload) {
    return this.requestService.checkPendingRequest(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: '견적 요청서 상세 조회' })
  @ApiParam({ name: 'id', description: '견적 요청서 ID(UUID)' })
  @UseGuards(AccessTokenGuard)
  async getRequestById(@Param('id') id: string) {
    return this.requestService.getRequestById(id);
  }
}
