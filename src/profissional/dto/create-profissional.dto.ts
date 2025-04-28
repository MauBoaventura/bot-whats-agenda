import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Servico } from '../../servicos/entities/servico.entity';

export class CreateProfissionalDto {
  @IsNotEmpty()
  @IsString()
  nome: string;
  
  @IsNotEmpty()
  @IsString()
  telefone: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  biografia?: string;
  
  @IsNotEmpty()
  @IsString()
  horarioInicio: string;
  
  @IsNotEmpty()
  @IsString()
  horarioFim: string;
  
  @IsArray()
  diasTrabalho: number[];
  
  @IsOptional()
  @IsInt()
  @Min(5)
  intervaloConsulta?: number;
  
  @IsOptional()
  servicos?: Servico[];
  
  @IsOptional()
  @IsString()
  fotoPerfil?: string;
  
  @IsOptional()
  @IsEnum(['ativo', 'inativo', 'ferias'])
  status?: 'ativo' | 'inativo' | 'ferias';
}
