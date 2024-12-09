import { Injectable, HttpException, HttpStatus,Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { MarketData } from "../../entities/marketdata.entity";
import { Order } from "../../entities/order.entity";
import { OrderSide,OrderStatus } from "../../common/enums/order.enums";

import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    @InjectRepository(MarketData)
    private readonly marketDataRepository: Repository<MarketData>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  async getMarketData(instrumentId: number): Promise<MarketData> {
    try {
      const marketData = await this.marketDataRepository.findOne({
        where: { instrument: { id: instrumentId } },
        order: { date: "DESC" },
      });
      if (!marketData) {
        throw new HttpException(
          "Datos de mercado no encontrados",
          HttpStatus.NOT_FOUND
        );
      }
      return marketData;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener datos de mercado para el instrumento con ID ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudieron obtener los datos de mercado",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getLatestPrice(instrumentId: number): Promise<number> {
    try {
      const marketData = await this.getMarketData(instrumentId);
      return marketData.close;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener el precio más reciente para el instrumento con ID ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo obtener el precio más reciente",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async calculatePositionMarketValue(
    size: number,
    userId: number,
    instrumentId: number
  ): Promise<number> {
    const priceClose = await this.getLatestPrice(instrumentId);
    const marketValue = size * priceClose;
    return marketValue;
  }

  async getPerformance(instrumentId: number): Promise<number> {
    try {
      const marketData = await this.getMarketData(instrumentId);
      if (!marketData.previousClose || marketData.previousClose <= 0) {
        throw new HttpException(
          "Datos insuficientes para calcular el rendimiento",
          HttpStatus.BAD_REQUEST
        );
      }
      return (
        ((marketData.close - marketData.previousClose) /
          marketData.previousClose) *
        100
      );
    } catch (error: any) {
      this.logger.error(
        `Error al calcular el rendimiento para el instrumento con ID ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo calcular el rendimiento",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async calculateDailyReturn(instrumentId: number): Promise<number> {
    try {
      const marketData = await this.getMarketData(instrumentId);

      if (!marketData.previousClose || marketData.previousClose <= 0) {
        throw new HttpException(
          "Datos insuficientes para calcular el rendimiento diario",
          HttpStatus.BAD_REQUEST
        );
      }

      const dailyReturn =
        ((marketData.close - marketData.previousClose) /
          marketData.previousClose) *
        100;
      return dailyReturn;
    } catch (error: any) {
      this.logger.error(
        `Error al calcular el retorno diario para el instrumento con ID ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo calcular el retorno diario",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPerformanceTotal(userId: number, instrumentId: number): Promise<number> {
    try {
      const marketData = await this.marketDataRepository.findOne({
        where: { instrument: { id: instrumentId } },
        order: { date: "DESC" },
      });

      if (!marketData) {
        throw new HttpException(
          "No se encontraron datos de mercado para el instrumento",
          HttpStatus.NOT_FOUND
        );
      }

      const priceClose = marketData.close;

      const buyOrders = await this.getBuyOrdersByInstrument(userId,instrumentId)

      if (!buyOrders.length) {
        throw new HttpException(
          "No se encontraron órdenes de compra FILLED",
          HttpStatus.NOT_FOUND
        );
      }

      let totalSpent = 0;
      let totalSize = 0;

      buyOrders.forEach((order) => {
        totalSpent += order.size * order.price;
        totalSize += order.size;
      });

      const pricePurchase = totalSpent / totalSize;

      const performance = ((priceClose - pricePurchase) / pricePurchase) * 100;

      return performance;
    } catch (error) {
      this.logger.error(
        `Error al calcular el rendimiento para el usuario con ID: ${userId} y el instrumento con ID: ${instrumentId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo calcular el rendimiento total",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getBuyOrdersByInstrument(userId: number, instrumentId: number) {
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
}
