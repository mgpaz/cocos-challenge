import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from '../../entities/instrument.entitiy';
import { AssetService } from './asset.service';
import { AssetController } from '../../controllers/asset.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Instrument])
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService]

})
export class AssetsModule {}
