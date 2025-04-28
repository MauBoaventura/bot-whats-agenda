import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  UpdateDateColumn
} from 'typeorm';
import { Servico } from '../../servicos/entities/servico.entity';

@Entity()
export class Profissional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 20 })
  telefone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  biografia?: string;

  @Column({ type: 'time' })
  horarioInicio: string; // Ex: "09:00"

  @Column({ type: 'time' })
  horarioFim: string; // Ex: "18:00"

  // Dias da semana que trabalha (0 = domingo, 1 = segunda, etc)
  @Column('simple-array')
  diasTrabalho: number[]; // Ex: [1,2,3,4,5] para segunda a sexta

  // Intervalo padrão entre consultas em minutos
  @Column({ default: 30 })
  intervaloConsulta: number;

  // Relação com serviços oferecidos
  @ManyToMany(() => Servico)
  @JoinTable({
    name: 'profissional_servico',
    joinColumn: { name: 'profissionalId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'servicoId', referencedColumnName: 'id' }
  })
  servicos: Servico[];

  @Column({ nullable: true })
  fotoPerfil?: string; // URL ou caminho para a imagem

  @Column({ 
    type: 'enum', 
    enum: ['ativo', 'inativo', 'ferias'], 
    default: 'ativo' 
  })
  status: 'ativo' | 'inativo' | 'ferias';

  // Metadados e controles
  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @DeleteDateColumn()
  deletadoEm?: Date; // Para soft delete
}
