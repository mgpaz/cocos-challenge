import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,JoinColumn } from 'typeorm';
import { Instrument } from './instrument.entitiy';

@Entity('marketdata')
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  @Column('numeric', { precision: 10, scale: 2 })
  high: number;

  @Column('numeric', { precision: 10, scale: 2 })
  low: number;

  @Column('numeric', { precision: 10, scale: 2 })
  open: number;

  @Column('numeric', { precision: 10, scale: 2 })
  close: number;

  @Column('numeric', { precision: 10, scale: 2, name:"previousclose" })
  previousClose: number;

  @Column()
  date: Date;
}
