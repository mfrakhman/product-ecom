import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProductColorImagesService } from './product-color-images.service';

@ApiTags('Product Color Images')
@Controller('products/:productId/colors/:colorId/images')
export class ProductColorImagesController {
  constructor(
    private readonly productColorImagesService: ProductColorImagesService,
  ) {}

  @Get()
  getAll(
    @Param('productId') productId: string,
    @Param('colorId') colorId: string,
  ) {
    return this.productColorImagesService.findAll(productId, colorId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
      },
    },
  })
  upload(
    @Param('productId') productId: string,
    @Param('colorId') colorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText?: string,
  ) {
    return this.productColorImagesService.upload(productId, colorId, file, altText);
  }

  @Delete(':imageId')
  delete(
    @Param('productId') productId: string,
    @Param('colorId') colorId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productColorImagesService.delete(productId, colorId, imageId);
  }
}
