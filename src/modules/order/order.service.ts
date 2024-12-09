import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { In, Repository } from "typeorm";
import { Order } from "../../entities/order.entity";
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from "../../common/enums/order.enums";
import { MarketDataService } from "../marketdata/marketdata.service";
import { PositionService } from "../position/position.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetService } from "../asset/asset.service";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly marketDataService: MarketDataService,
    private readonly positionService: PositionService,
    private readonly assetService: AssetService
  ) {}

  async createOrder(dto: CreateOrderDto) {
    try {
      const marketData = await this.validateMarketData(dto.instrumentId);
      const price = this.getOrderPrice(dto.type, marketData.close, dto.price);
      this.validatePrice(price);

      const orderValue = dto.size * price;
      let status = OrderStatus.NEW;
      if (dto.side === OrderSide.BUY) {
        if (!(await this.validateFunds(dto.userId, orderValue))) {
          status = OrderStatus.REJECTED;
        }
      } else if (dto.side === OrderSide.SELL) {
        if (
          !(await this.validateUserPosition(
            dto.userId,
            dto.instrumentId,
            dto.size
          ))
        ) {
          status = OrderStatus.REJECTED;
        }
      }

      const order = this.orderRepository.create({
        status,
        instrument: { id: dto.instrumentId },
        user: { id: dto.userId },
        side: dto.side,
        price: dto.price,
        type: dto.type,
        size: dto.size,
      });

      const savedOrder = await this.orderRepository.save(order);

      if (savedOrder.id) {
        await this.positionService.updateAfterOrder({
          order: savedOrder,
          userId: dto.userId,
          instrumentId: dto.instrumentId,
        });
        if (savedOrder.type == OrderType.MARKET) {
          await this.cashOrder({
            value: await this.marketDataService.calculatePositionMarketValue(
              order.size,
              order.user.id,
              order.instrument.id
            ),
            userId: dto.userId,
            side:
              dto.side === OrderSide.SELL
                ? OrderSide.CASH_IN
                : OrderSide.CASH_OUT,
          });
          await this.updateOrder(order.id, {
            status: OrderStatus.FILLED,
          });
        }
      }

      return await this.getOrder(savedOrder.id)
      
    } catch (error: any) {
      this.logger.error("Error al crear la orden", error.stack);
      throw new HttpException(
        "No se pudo crear la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async cashOrder(params: {
    value: number;
    userId: number;
    side: string;
  }) {
    const { value, userId, side } = params;
    const instrument = await this.assetService.findByTicker("ARS");
    const cash = await this.getCashAvailable(userId);

    return await this.orderRepository.save({
      instrument: { id: instrument.id },
      user: { id: userId },
      side,
      price: 1,
      type: OrderType.MARKET,
      size: Math.round(value),
      status: OrderStatus.FILLED,
    });
  }

  async getOrders(userId: number, { page = 1, limit = 10 }) {

    try {
      const [orders, total] = await this.orderRepository.findAndCount({
        where: { user: { id: userId } },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: orders,
        meta: {
          totalItems: total,
          itemCount: orders.length,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error al obtener las órdenes para el usuario con ID: ${userId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudieron obtener las órdenes",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getOrder(id: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: id },
        relations: ["user", "instrument"],
      });      
      if (!order) {
        throw new HttpException("Orden no encontrada", HttpStatus.NOT_FOUND);
      }
      return order;
    } catch (error: any) {
      this.logger.error(`Error al obtener la orden con ID: ${id}`, error.stack);
      throw new HttpException(
        "No se pudo obtener la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrder(id: number, dto: UpdateOrderDto) {
    try {
      const order = await this.getOrder(id)

      Object.assign(order, dto);

      return await this.orderRepository.save(order);
    } catch (error: any) {
      this.logger.error(
        `Error al actualizar la orden con ID: ${id}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo actualizar la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelOrder(orderId: number) {
    try {
      const order = await this.getOrder(orderId)

      if (order.status !== "NEW") {
        throw new HttpException(
          "Solo se pueden cancelar órdenes en estado NEW",
          HttpStatus.BAD_REQUEST
        );
      }

      order.status = "CANCELLED";
      return await this.orderRepository.save(order);
    } catch (error: any) {
      this.logger.error("Error al cancelar la orden", error.stack);
      throw new HttpException(
        "No se pudo cancelar la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async processLimitBuyOrder(orderId: number) {
    try {
      const order = await this.getOrder(orderId)
      if (order.type !== OrderType.LIMIT || order.status !== OrderStatus.NEW) {
        throw new HttpException(
          "La orden no es del tipo LIMIT ",
          HttpStatus.BAD_REQUEST
        );
      }
      const orderValue = order.size * order.price;

      if (order.side == OrderSide.BUY) {
        const availableFunds = await this.getCashAvailable(order.user.id);
        if (availableFunds < orderValue) {
          throw new HttpException(
            "Fondos insuficientes para ejecutar la orden",
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const userPosition = await this.positionService.getUserPosition(
        order.user.id,
        order.instrument.id
      );

      if (!userPosition) {
        await this.positionService.updatePosition(
          order.user.id,
          order.instrument.id,
          order.size
        );
      } else {
        await this.positionService.updatePosition(
          order.user.id,
          order.instrument.id,
          userPosition.size + order.size
        );
      }

      await this.updateOrder(order.id, { status: OrderStatus.FILLED });
      const orderSide = order.side ==OrderSide.BUY? OrderSide.CASH_OUT: OrderSide.CASH_IN 
      await this.cashOrder({
        value: orderValue,
        userId: order.user.id,
        side: orderSide,
      });

      return {
        message: "Orden procesada exitosamente",
        orderId: order.id,
        status: OrderStatus.FILLED,
      };
    } catch (error: any) {
      this.logger.error("Error al procesar la orden LIMIT BUY", error.stack);
      throw new HttpException(
        "Error al procesar la orden LIMIT BUY",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async validateMarketData(instrumentId: number) {
    const marketData = await this.marketDataService.getMarketData(instrumentId);
    if (!marketData) {
      throw new HttpException(
        "Datos de mercado no encontrados",
        HttpStatus.NOT_FOUND
      );
    }
    return marketData;
  }

  private getOrderPrice(
    type: string,
    marketPrice: number,
    inputPrice?: number
  ): number {
    return type === OrderType.MARKET ? marketPrice : inputPrice || marketPrice;
  }

  private validatePrice(price: any) {
    if (!price || price <= 0) {
      throw new HttpException("Precio inválido", HttpStatus.BAD_REQUEST);
    }
  }

  async getCashAvailable(userId: number): Promise<number> {
    const cashOrders = await this.orderRepository.find({
      where: {
        user: { id: userId },
        status: OrderStatus.FILLED,
        side: In([OrderSide.CASH_IN, OrderSide.CASH_OUT]),
      },
    });

    return cashOrders.reduce((acc, order) => {
      return order.side === OrderSide.CASH_IN
        ? acc + order.size
        : acc - order.size;
    }, 0);
  }

  async getBuyOrdersByInstrument(userId: number, instrumentId: number) {
    try {
      const buyOrders = await this.orderRepository.find({
        where: {
          user: { id: userId },
          instrument: { id: instrumentId },
          side: OrderSide.BUY,
          status: OrderStatus.FILLED,
        },
      });

      if (!buyOrders.length) {
        throw new HttpException(
          "No se encontraron órdenes de compra FILLED",
          HttpStatus.NOT_FOUND
        );
      }

      return buyOrders;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener las órdenes de compra FILLED para el usuario ${userId} y el instrumento ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo obtener las órdenes de compra FILLED",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async validateFunds(userId: number, orderValue: number) {
    const cashAvailable = await this.getCashAvailable(userId);
    return !(orderValue > cashAvailable);
  }

  private async validateUserPosition(
    userId: number,
    instrumentId: number,
    size: number
  ) {
    const userPosition = await this.positionService.getUserPosition(
      userId,
      instrumentId
    );
    return !(!userPosition || userPosition.size < size);
  }
}
