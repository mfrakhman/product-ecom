import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsInt, IsString, Min, IsUUID } from 'class-validator';

export class CreateSkuDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  skuCode!: string;

  @ApiProperty()
  @IsString()
  size!: string;

  @ApiProperty()
  @IsString()
  color!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

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
