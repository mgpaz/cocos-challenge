import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { OrderModule } from "./modules/order/order.module";
import { PortfolioModule } from "./modules/portafolio/portafolio.module";
import { AssetsModule } from "./modules/asset/asset.module";
import { UserModule } from "./modules/user/user.module";
import { MarketDataModule } from "./modules/marketdata/marketdata.module";
import { Order } from "./entities/order.entity";
import { Instrument } from "./entities/instrument.entitiy";
import { User } from "./entities/user.entity";
import { MarketData } from "./entities/marketdata.entity";
import { AppConfigModule } from "./config/config.module";
import { PositionModule } from "./modules/position/position.module";
import { Position } from "./entities/position.entity";

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get("database");
        return {
          type: "postgres",
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [Order, Instrument, User, MarketData, Position],
        };
      },
    }),
    OrderModule,
    PortfolioModule,
    AssetsModule,
    UserModule,
    MarketDataModule,
    PositionModule
  ],
})
export class AppModule {}
