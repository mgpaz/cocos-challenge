import { IsOptional, IsEnum, IsNumber, IsPositive, IsInt } from 'class-validator';

export enum OrderStatus {
  NEW = 'NEW',
  FILLED = 'FILLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Estado inválido. Debe ser uno de los valores permitidos.' })
  status?: OrderStatus;
}