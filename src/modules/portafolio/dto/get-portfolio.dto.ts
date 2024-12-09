import { IsOptional, IsInt, Min } from "class-validator";

export class GetPortfolioDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
