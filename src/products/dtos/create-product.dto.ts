import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ArrayMinSize,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSkuDto } from '../../skus/dtos/create-sku.dto';

export class CreateSkuInProductDto extends OmitType(CreateSkuDto, [
  'product_id',
  'quantity',
] as const) {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category id from categories table' })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({ description: 'apparel | footwear_uk | waist — omit for bags' })
  @IsOptional()
  @IsString()
  sizeGroup?: string;

  @ApiProperty({ type: [CreateSkuInProductDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSkuInProductDto)
  skus!: CreateSkuInProductDto[];
}
