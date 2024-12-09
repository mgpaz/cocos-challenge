import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { Instrument } from '../../../entities/instrument.entitiy';

export class PositionDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => Instrument })
  instrument: Instrument;

  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty()
  size: number;

  @ApiProperty()
  marketValue: number;

  @ApiProperty()
  dailyReturn: number;
}
