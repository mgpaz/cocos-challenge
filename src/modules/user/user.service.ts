import { Injectable, HttpException, HttpStatus,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,

  ) {}

  async findById(userId: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error:any) {
      this.logger.error(`Error al buscar usuario con ID ${userId}`, error.stack);
      throw new HttpException('No se pudo buscar el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}