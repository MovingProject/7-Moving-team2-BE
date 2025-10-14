import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Inject, Post, UseGuards, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CreateQuoteRequestBodyDto, createQuoteRequestBodySchema } from './dto/create-quote-request.dto';
import { type IRequestService, REQUEST_SERVICE } from './interface/request.service.interface';
import { RolesGuard } from '../auth/guards/role.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';

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
}
