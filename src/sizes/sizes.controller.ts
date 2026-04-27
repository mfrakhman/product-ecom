import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dtos/create-size.dto';
import { UpdateSizeDto } from './dtos/update-size.dto';

@ApiTags('Sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  @ApiQuery({ name: 'sizeGroup', required: false, description: 'apparel | footwear_uk | waist' })
  getAll(@Query('sizeGroup') sizeGroup?: string) {
    return this.sizesService.findAll(sizeGroup);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sizesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSizeDto) {
    return this.sizesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSizeDto) {
    return this.sizesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sizesService.delete(id);
  }
}
