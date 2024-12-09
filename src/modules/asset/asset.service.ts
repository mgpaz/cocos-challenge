import { Injectable, HttpException, HttpStatus,Logger } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { Instrument } from '../../entities/instrument.entitiy';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @InjectRepository(Instrument) private readonly instrumentRepository: Repository<Instrument>
  ) {}

  async searchAssets(query: string, { page = 1, limit = 10 }) {
    try {
      const [assets, total] = await this.instrumentRepository.findAndCount({
        where: [
          { ticker: ILike(`%${query.toLowerCase()}%`) },
          { name: ILike(`%${query.toLowerCase()}%`) },
        ],
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: assets,
        meta: {
          totalItems: total,
          itemCount: assets.length,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error:any) {
      this.logger.error('Error al buscar activos', error.stack);
      throw new HttpException('No se pudieron buscar activos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(assetId: number) {
    try {
      const asset = await this.instrumentRepository.findOne({ where: { id: assetId } });
      if (!asset) {
        throw new HttpException('Activo no encontrado', HttpStatus.NOT_FOUND);
      }
      return asset;
    } catch (error:any) {
      this.logger.error(`Error al obtener el activo con ID ${assetId}`, error.stack);
      throw new HttpException('No se pudo obtener el activo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  async findByTicker(ticker: string) {
    try {
      const asset = await this.instrumentRepository.findOne({ where: { ticker: ticker } });
      if (!asset) {
        throw new HttpException('Activo no encontrado', HttpStatus.NOT_FOUND);
      }
      return asset;
    } catch (error:any) {
      this.logger.error(`Error al obtener el activo con ID ${ticker}`, error.stack);
      throw new HttpException('No se pudo obtener el activo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}