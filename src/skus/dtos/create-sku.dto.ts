import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSkuDto {
  @ApiProperty()
  @IsString()
  skuCode!: string;

  @ApiProperty({ description: 'Color id from colors table' })
  @IsUUID()
  colorId!: string;

  @ApiPropertyOptional({ description: 'Size id from sizes table — omit for bags/one-size' })
  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @ApiProperty({ description: 'Price in IDR, e.g. 780000 = Rp 780.000' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'Original price in IDR for sale display' })
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAt?: number;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty()
  @IsUUID()
  product_id!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
