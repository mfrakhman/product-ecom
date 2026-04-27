import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductColorImage } from '../entities/product-color-image.entity';
import { StorageService } from '../../storage/storage.service';
import { Product } from '../entities/product.entity';
import { Color } from '../../colors/entities/color.entity';

@Injectable()
export class ProductColorImagesService {
  constructor(
    @InjectRepository(ProductColorImage)
    private readonly imageRepo: Repository<ProductColorImage>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Color)
    private readonly colorRepo: Repository<Color>,
    private readonly storageService: StorageService,
  ) {}

  async findAll(productId: string, colorId: string) {
    await this.assertProductAndColor(productId, colorId);
    const images = await this.imageRepo.find({
      where: { productId, colorId },
      order: { displayOrder: 'ASC' },
    });
    return { message: 'success', data: images };
  }

  async upload(
    productId: string,
    colorId: string,
    file: Express.Multer.File,
    altText?: string,
  ) {
    await this.assertProductAndColor(productId, colorId);

    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('File must be an image');

    const objectName = this.storageService.buildObjectName(
      `products/${productId}/colors/${colorId}`,
      Date.now().toString(),
      file.originalname,
    );
    const imageUrl = await this.storageService.upload(
      objectName,
      file.buffer,
      file.mimetype,
    );

    const count = await this.imageRepo.count({ where: { productId, colorId } });
    const image = this.imageRepo.create({
      productId,
      colorId,
      imageUrl,
      imageObject: objectName,
      altText: altText ?? null,
      displayOrder: count,
    });
    await this.imageRepo.save(image);
    return { message: 'Image uploaded successfully', data: image };
  }

  async delete(productId: string, colorId: string, imageId: string) {
    const image = await this.imageRepo.findOne({
      where: { id: imageId, productId, colorId },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.imageObject) await this.storageService.delete(image.imageObject);
    await this.imageRepo.delete(imageId);
    return { message: 'Image deleted successfully' };
  }

  private async assertProductAndColor(productId: string, colorId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const color = await this.colorRepo.findOne({ where: { id: colorId } });
    if (!color) throw new NotFoundException('Color not found');
  }
}
