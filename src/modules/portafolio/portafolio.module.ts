import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portafolio.service';
import { PortfolioController } from '../../controllers/portafolio.controller';
import { Order } from '../../entities/order.entity';
import { UserModule } from '../user/user.module';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { PositionModule } from '../position/position.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    MarketDataModule,
    PositionModule,
    OrderModule
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService]

})
export class PortfolioModule {}