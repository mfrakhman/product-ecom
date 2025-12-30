import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class restockSkuDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
