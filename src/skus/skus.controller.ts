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
}
