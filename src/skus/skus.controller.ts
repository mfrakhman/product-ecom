import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkusService } from './skus.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateSkuDto } from './dtos/create-sku.dto';
import { restockSkuDto } from './dtos/restock-sku.dto';

@ApiTags('SKUs')
@Controller('skus')
export class SkusController {
  constructor(private readonly skusService: SkusService) {}

  @Post()
  async create(@Body() dto: CreateSkuDto) {
    return this.skusService.create(dto);
  }

  @Get()
  async getAll() {
    return this.skusService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.skusService.findById(id);
  }

  @Post(':skuId/restock')
  async restockSku(@Param('skuId') skuId: string, @Body() dto: restockSkuDto) {
    return this.skusService.restockSku(skuId, dto);
  }

  @Post('/validate')
  async validateSkus(@Body() body: { skuIds: string[] }) {
    return this.skusService.validateSkus(body.skuIds);
  }
}
