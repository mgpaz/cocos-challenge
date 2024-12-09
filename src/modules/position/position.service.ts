import { Injectable, HttpException, HttpStatus,Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "../../entities/position.entity";
import { Order } from "../../entities/order.entity";
import { MarketDataService } from "../marketdata/marketdata.service";
import { AssetService } from "../asset/asset.service";
import { PositionDto } from "./dto/position.dto";
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from "../../common/enums/order.enums";

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    private readonly marketDataService: MarketDataService,
    private readonly assetService: AssetService
  ) {}

  async getUserPositions(userId: number): Promise<PositionDto[]> {
    try {
      const positions = await this.positionRepository.find({
        where: { user: { id: userId } },
        relations: ["user", "instrument"],
      });

      if (!positions || positions.length === 0) {
        throw new HttpException(
          "No se encontraron posiciones para el usuario",
          HttpStatus.NOT_FOUND
        );
      }

      for (const position of positions) {
        const marketValue =
          await this.marketDataService.calculatePositionMarketValue(
            position.size,
            userId,
            position.instrument.id
          );
        const dailyReturn = await this.marketDataService.calculateDailyReturn(
          position.instrument.id
        );

        position["marketValue"] = marketValue;
        position["dailyReturn"] = dailyReturn;
      }

      return positions.map((position) => this.mapToPositionDto(position));
    } catch (error: any) {
      this.logger.error(
        "Error al obtener las posiciones del usuario",
        error.stack
      );
      throw new HttpException(
        "No se pudieron obtener las posiciones",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserPosition(
    userId: number,
    instrumentId: number
  ): Promise<PositionDto> {
    try {
      const position = await this.positionRepository.findOne({
        where: { instrument: { id: instrumentId }, user: { id: userId } },
        relations: ["user", "instrument"],
      });

      if (!position) {
        throw new HttpException("Posición no encontrada", HttpStatus.NOT_FOUND);
      }

      // Calculando valores de mercado y rendimiento diario
      position["marketValue"] =
        await this.marketDataService.calculatePositionMarketValue(
          position.size,
          userId,
          position.instrument.id
        );
      position["dailyReturn"] =
        await this.marketDataService.calculateDailyReturn(
          position.instrument.id
        );

      // Mapear a DTO
      return this.mapToPositionDto(position);
    } catch (error: any) {
      this.logger.error(
        `Error al obtener la posición del usuario con ID: ${userId}`,
        error.stack
      );
      throw new HttpException(
        "No se pudo obtener la posición",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updatePosition(userId: number, instrumentId: number, size: number) {
    try {
      let position = await this.positionRepository.findOne({
        where: { user: { id: userId }, instrument: { id: instrumentId } },
        relations: ["user", "instrument"],
      });

      if (!position) {
        position = this.positionRepository.create({
          user: { id: userId },
          instrument: { id: instrumentId },
          size,
        });
        await this.positionRepository.save(position);
      } else {
        position.size += size;
        await this.positionRepository.save(position);
      }
    } catch (error: any) {
      this.logger.error(
        "Error al actualizar la posición del usuario",
        error.stack
      );
      throw new HttpException(
        "No se pudo actualizar la posición",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateAfterOrder(params: {
    order: Order;
    userId: number;
    instrumentId: number;
  }) {
    const { order, instrumentId, userId } = params;
    try {
      if (
        order.side === OrderSide.BUY &&
        order.status === OrderStatus.NEW &&
        order.type === OrderType.MARKET
      ) {
        return await this.updatePosition(userId, instrumentId, order.size);
      } else if (
        order.side === OrderSide.SELL &&
        order.status === OrderStatus.NEW &&
        order.type === OrderType.MARKET
      ) {
        return await this.updatePosition(userId, instrumentId, -order.size);
      }
      return null;
    } catch (error: any) {
      this.logger.error(
        "Error al actualizar la posición después de la orden",
        error.stack
      );
      throw new HttpException(
        "No se pudo actualizar la posición después de la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private mapToPositionDto(position: Position): PositionDto {
    const positionDto = new PositionDto();
    positionDto.id = position.id;
    positionDto.instrument = position.instrument;
    positionDto.user = position.user;
    positionDto.size = position.size;
    positionDto.marketValue = position["marketValue"];
    positionDto.dailyReturn = position["dailyReturn"];
    return positionDto;
  }
}
