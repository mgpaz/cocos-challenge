import { IsEnum, IsInt, IsPositive, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  instrumentId: number;

  @IsInt()
  @IsPositive()
  size: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsEnum(['MARKET', 'LIMIT'])
  type: string;

  @IsEnum(['BUY', 'SELL'])
  side: string;
}