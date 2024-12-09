import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionService } from './position.service';
import { Position } from '../../entities/position.entity';
import { UserModule } from '../user/user.module';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { AssetsModule } from '../asset/asset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
    UserModule,
    MarketDataModule,
    AssetsModule,
  ],
  providers: [PositionService],
  exports: [PositionService]

})
export class PositionModule {}