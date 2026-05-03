import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsUUID()
  genderId!: string;

  @IsUUID()
  groupId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
