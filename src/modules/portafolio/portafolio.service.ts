import { Injectable, HttpException, HttpStatus,Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { Order } from "../../entities/order.entity";
import { PositionService } from "../position/position.service";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderService } from "../order/order.service";
import { MarketDataService } from "../marketdata/marketdata.service";
import { PositionDto } from "../position/dto/position.dto";
import { formatNumber } from "../../common/utils/utils";

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly positionService: PositionService,
    private readonly orderService: OrderService,
    private readonly marketDataService: MarketDataService
  ) {}

  async getPortfolio(userId: number) {
    try {
      const positions: PositionDto[] =
        await this.positionService.getUserPositions(userId);
      const cashAvailable = await this.orderService.getCashAvailable(userId);
      const result = await this.formatPositions(positions);

      const totalValue = await this.calculateTotalValue(
        positions,
        cashAvailable
      );
      return {
        data: result,
        summary: {
          totalValue: formatNumber(totalValue),
          cashAvailable: formatNumber(cashAvailable),
        },
      };
    } catch (error: any) {
      this.logger.error("Error al obtener el portfolio", error.stack);
      throw new HttpException(
        "No se pudo obtener el portfolio",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  private async calculateTotalValue(
    positions: PositionDto[],
    cashAvailable: number
  ) {
    const portfolio = await Promise.all(
      positions.map(async (position) => {
        return {
          value: position.marketValue,
        };
      })
    );

    const totalValue = portfolio.reduce(
      (acc, pos) => acc + pos.value,
      cashAvailable
    );
    return totalValue;
  }

  private async formatPositions(positions: PositionDto[]) {
    return await Promise.all(
      positions.map(async (position) => {
        const performanceTotal =
          await this.marketDataService.getPerformanceTotal(
            position.user.id,
            position.instrument.id
          );
        return {
          instrumentId: position.instrument.id,
          instrumentName: position.instrument.name,
          size: position.size,
          marketValue: formatNumber(position.marketValue),
          performance: formatNumber(position.dailyReturn),
          performanceTotal: formatNumber(performanceTotal)
        };
      })
    );
  }
}
