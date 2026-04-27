import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({ example: 'Camel' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'camel' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: '#B89968' })
  @IsHexColor()
  hex!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
