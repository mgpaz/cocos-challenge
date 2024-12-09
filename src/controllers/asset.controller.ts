import { Controller, Get, Query, Param, HttpException, HttpStatus,Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AssetService } from '../modules/asset/asset.service';
import { SearchAssetsDto } from '../modules/asset/dto/search-assets.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetController {
  private readonly logger = new Logger(AssetController.name);

  constructor(
    private readonly assetService: AssetService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar activos' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Texto para buscar activos por ticker o nombre' })
  @ApiResponse({ status: 200, description: 'Activos encontrados' })
  @ApiResponse({ status: 404, description: 'No se encontraron activos' })
  async searchAssets(@Query('query') query: string, @Query() pagination: SearchAssetsDto) {
    try {
      const result = await this.assetService.searchAssets(query, pagination);
      return result;
    } catch (error:any) {
      this.logger.error('Error al buscar activos', error.stack);
      throw new HttpException('No se pudieron buscar activos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un activo por ID' })
  @ApiResponse({ status: 200, description: 'Activo encontrado' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async getAsset(@Param('id') id: number) {
    try {
      const asset = await this.assetService.findById(id);
      return asset;
    } catch (error:any) {
      this.logger.error(`Error al obtener el activo con ID: ${id}`, error.stack);
      throw new HttpException('No se pudo obtener el activo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
