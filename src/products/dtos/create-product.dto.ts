import { IsEnum, IsString } from 'class-validator';
import { Category } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category: Category;

}
