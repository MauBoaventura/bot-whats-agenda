// src/agendamento/entities/agendamento.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Servico } from '../../servicos/entities/servico.entity';

@Entity()
export class Agendamento {
  @PrimaryGeneratedColumn()
  id: number;

  // Dados do Cliente (WhatsApp)
  @Column({ length: 20 })
  clienteTelefone: string; // Número do WhatsApp (from)

  @Column({ length: 100, nullable: true })
  clienteNome?: string; // Opcional (pode ser preenchido depois)

  // Relacionamento com Servico
  @ManyToOne(() => Servico, { eager: true }) // Carrega o serviço automaticamente
  @JoinColumn({ name: 'servicoId' }) // Define o nome da coluna de chave estrangeira
  servico: Servico;

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

  @Column({
    type: 'enum',
    enum: ['nao_pago', 'pago', 'em_processamento'],
    default: 'nao_pago',
  })
  statusPagamento: 'nao_pago' | 'pago' | 'em_processamento'; // Status do pagamento

  @CreateDateColumn()
  criadoEm: Date; // Data/hora do registro

  @Column({ type: 'boolean', default: false })
  lembreteEnviado: boolean; // Controle de lembrete
}
