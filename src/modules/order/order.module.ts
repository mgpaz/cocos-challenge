import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from '../../controllers/order.controller';
import { Order } from '../../entities/order.entity';
import { UserModule } from '../user/user.module';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { PositionModule } from '../position/position.module';
import { AssetsModule } from '../asset/asset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    forwardRef(() => MarketDataModule),
    PositionModule,
    AssetsModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]

})
export class OrderModule {}