import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { QuotationStatus } from '@prisma/client';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { UpdateQuotationStatusSchema } from './dto/quotation-status.dto';
import type { UpdateQuotationStatusDto } from './dto/quotation-status.dto';

@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('DRIVER')
  async findDriverQuotationsByStatus(
    @AuthUser() user: AccessTokenPayload,
    @Query('status') status?: QuotationStatus[],
  ) {
    return this.quotationService.findDriverQuotationsByStatus(user.sub, status);
  }

  @Get('consumer/quotations')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async findConsumerQuotations(@AuthUser() user: AccessTokenPayload) {
    const quotations = await this.quotationService.findConsumerQuotations(user.sub);
    return {
      success: true,
      data: quotations,
    };
  }

  @Post(':quotationId/accept')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  @HttpCode(HttpStatus.OK)
  async acceptQuotation(@Param('quotationId') quotationId: string, @AuthUser() user: AccessTokenPayload) {
    const result = await this.quotationService.acceptQuotation(quotationId, user.sub);
    return {
      success: true,
      data: result,
    };
  }
  @Post('complete/schedule')
  async scheduleCompletion(
    @Body(new ZodValidationPipe(UpdateQuotationStatusSchema))
    dto: UpdateQuotationStatusDto,
  ) {
    return this.quotationService.scheduleQuotationCompletion(dto);
  }
}
