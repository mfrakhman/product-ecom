import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({ example: 'apparel', description: 'apparel | footwear_uk | waist' })
  @IsString()
  sizeGroup!: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'm' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  sortOrder!: number;
}
