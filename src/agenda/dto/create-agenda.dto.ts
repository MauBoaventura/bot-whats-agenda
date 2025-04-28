import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Servico } from "../../servicos/entities/servico.entity";

export class CreateAgendaDto {
  @IsString()
  clienteTelefone: string;

  @IsString()
  @IsOptional()
  clienteNome?: string;

  @IsOptional()
  servico: Servico;

  @IsDate()
  data: Date;

  @IsString()
  horario: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsEnum(['pendente', 'confirmado', 'cancelado', 'concluido'])
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';

  @IsEnum(['nao_pago', 'pago', 'em_processamento'])
  statusPagamento: 'nao_pago' | 'pago' | 'em_processamento';

  @IsOptional()
  lembreteEnviado?: boolean;
}
