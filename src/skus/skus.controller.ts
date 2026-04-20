import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SkusService } from './skus.service';
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

  @Post('/validate')
  async validateSkus(@Body() body: { skuIds: string[] }) {
    return this.skusService.validateSkus(body.skuIds);
  }

  @Post(':skuId/restock')
  async restockSku(@Param('skuId') skuId: string, @Body() dto: restockSkuDto) {
    return this.skusService.restockSku(skuId, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.skusService.uploadImage(id, file);
  }

  @Delete(':id/image')
  deleteImage(@Param('id') id: string) {
    return this.skusService.deleteImage(id);
  }
}
