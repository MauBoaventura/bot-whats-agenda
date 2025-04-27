import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  nome: string;

  @IsString({ message: 'O telefone deve ser uma string válida.' })
  telefone: string;

  @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
  email: string;

  @IsEnum(['Regular', 'Premium', 'VIP'])
  @IsOptional()
  fidelidade?: 'Regular' | 'Premium' | 'VIP';
}
