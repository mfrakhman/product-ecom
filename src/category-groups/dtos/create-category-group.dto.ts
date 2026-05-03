import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryGroupDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
