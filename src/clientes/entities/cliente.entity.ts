import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column()
  nome: string;

  @Column()
  telefone: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ['Regular', 'Premium', 'VIP'],
    default: 'Regular',
  })
  fidelidade: 'Regular' | 'Premium' | 'VIP';

  @DeleteDateColumn()
  deletedAt?: Date;
}
