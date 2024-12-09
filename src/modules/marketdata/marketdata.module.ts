import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketData } from '../../entities/marketdata.entity';
import { MarketDataService } from './marketdata.service';
import { Order } from '../../entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketData,Order])
  ],
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}