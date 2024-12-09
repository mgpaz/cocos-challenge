import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Instrument } from './instrument.entitiy';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;


  @Column()
  size: number;
}
