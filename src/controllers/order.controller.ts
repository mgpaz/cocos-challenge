import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrderService } from '../modules/order/order.service';
import { CreateOrderDto } from '../modules/order/dto/create-order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o error en la lógica.',
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      const result = await this.orderService.createOrder(createOrderDto);
      return result;
    } catch (error) {
      this.logger.error('Error al crear la orden', error.stack);
      throw new HttpException('No se pudo crear la orden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de una orden' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden obtenidos exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada.' })
  async getOrder(@Param('id') id: number) {
    try {
      const result = await this.orderService.getOrder(id);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener la orden con ID: ${id}`, error.stack);
      throw new HttpException('No se pudo obtener la orden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes de un usuario' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Órdenes obtenidas exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getOrders(
    @Query('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const result = await this.orderService.getOrders(userId, { page, limit });
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener las órdenes para el usuario con ID: ${userId}`, error.stack);
      throw new HttpException('No se pudieron obtener las órdenes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('process/:id')
  @ApiOperation({ summary: 'Procesar orden de tipo LIMIT y SIDE BUY' })
  @ApiResponse({
    status: 200,
    description: 'Orden procesada exitosamente y convertida a FILLED.',
  })
  @ApiResponse({
    status: 400,
    description: 'Fondos insuficientes o error en la lógica de la orden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada o no es de tipo LIMIT o SIDE BUY.',
  })
  async processLimitBuyOrder(@Param('id') id: number) {
    try {
      const result = await this.orderService.processLimitBuyOrder(id);
      return result;
    } catch (error) {
      this.logger.error(`Error al procesar la orden con ID: ${id}`, error.stack);
      throw new HttpException('No se pudo procesar la orden LIMIT BUY', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('cancel/:id')
  @ApiOperation({ summary: 'Cancelar una orden' })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'La orden no está en estado NEW o error en la lógica.',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada.',
  })
  async cancelOrder(@Param('id') id: number) {
    try {
      const result = await this.orderService.cancelOrder(id);
      return result;
    } catch (error) {
      this.logger.error(`Error al cancelar la orden con ID: ${id}`, error.stack);
      throw new HttpException('No se pudo cancelar la orden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
