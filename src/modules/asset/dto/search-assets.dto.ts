import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class SearchAssetsDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}