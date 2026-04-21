import { IsEnum, IsString, IsArray, ValidateNested, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType, ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/product.entity';
import { CreateSkuDto } from '../../skus/dtos/create-sku.dto';

export class CreateSkuInProductDto extends OmitType(CreateSkuDto, ['product_id', 'quantity'] as const) {
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
  description!: string;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category!: Category;

  @ApiProperty({ type: [CreateSkuInProductDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSkuInProductDto)
  skus!: CreateSkuInProductDto[];
}
