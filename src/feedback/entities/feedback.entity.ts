// src/feedback/entities/feedback.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  clienteTelefone: string;

  @Column({ type: 'smallint' })
  nota: number; // 1 a 5

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @CreateDateColumn()
  data: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  atendente: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  servico: string | null;
}
