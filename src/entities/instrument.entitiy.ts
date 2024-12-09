import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('instruments')
export class Instrument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticker: string;

  @Column()
  name: string;

  @Column()
  type: string;
}
