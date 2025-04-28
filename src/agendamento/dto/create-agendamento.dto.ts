import { IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgendamentoDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 20)
  clienteTelefone: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  clienteNome?: string;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  servico: number; // ID do serviço

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  profissional?: number; // ID do profissional

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  data: Date;

  @IsNotEmpty()
  @IsString()
  horario: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsEnum(['pendente', 'confirmado', 'cancelado', 'concluido'])
  status?: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' = 'pendente';

  @IsOptional()
  @IsEnum(['nao_pago', 'pago', 'em_processamento'])
  statusPagamento?: 'nao_pago' | 'pago' | 'em_processamento' = 'nao_pago';

  @IsOptional()
  @IsBoolean()
  lembreteEnviado?: boolean = false;
}