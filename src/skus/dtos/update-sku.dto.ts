import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateSkuDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  colorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAt?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
