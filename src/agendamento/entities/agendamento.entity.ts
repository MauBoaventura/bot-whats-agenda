// src/agendamento/entities/agendamento.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Agendamento {
  @PrimaryGeneratedColumn()
  id: number;

  // Dados do Cliente (WhatsApp)
  @Column({ length: 20 })
  clienteTelefone: string; // Número do WhatsApp (from)

  @Column({ length: 100, nullable: true })
  clienteNome?: string; // Opcional (pode ser preenchido depois)

  // Detalhes do Agendamento
  @Column({ type: 'varchar', length: 50 })
  servico: string; // Ex: "Corte de Cabelo", "Barba" (servicoEscolhido)

  @Column({ type: 'date' })
  data: Date; // Data no formato YYYY-MM-DD (dataSelecionada.id)

  @Column({ type: 'time' })
  horario: string; // Ex: "14:00" (horarioEscolhido.title)

  @Column({ type: 'text', nullable: true })
  observacao?: string; // Comentários adicionais

  // Status e Metadados
  @Column({
    type: 'enum',
    enum: ['pendente', 'confirmado', 'cancelado', 'concluido'],
    default: 'pendente',
  })
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';

  @CreateDateColumn()
  criadoEm: Date; // Data/hora do registro

  @Column({ type: 'boolean', default: false })
  lembreteEnviado: boolean; // Controle de lembrete
}
