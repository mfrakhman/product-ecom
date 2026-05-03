import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateGenderDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
