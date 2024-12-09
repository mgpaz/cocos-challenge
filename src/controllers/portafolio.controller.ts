import { Controller, Get, Param, Query, HttpException, HttpStatus,Logger } from '@nestjs/common';
import { PortfolioService } from '../modules/portafolio/portafolio.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);

  constructor(
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener el portfolio de un usuario' })
  @ApiResponse({ status: 200, description: 'Se obtuvo el portfolio correctamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getPortfolio(
    @Param('userId') userId: number
  ) {
    try {
      return await this.portfolioService.getPortfolio(userId);
    } catch (error:any) {
      this.logger.error(`Error al obtener el portfolio del usuario con ID: ${userId}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('No se pudo obtener el portfolio', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
