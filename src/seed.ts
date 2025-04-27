// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Servico } from './servicos/entities/servico.entity';
import { Cliente } from './clientes/entities/cliente.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const servicoRepo = dataSource.getRepository(Servico);
  const clienteRepo = dataSource.getRepository(Cliente);

  const servicos = [
    { nome: 'Corte Masculino', duracao: 30, preco: 30.0, categoria: 'Barbearia', status: true },
    { nome: 'Corte Feminino', duracao: 45, preco: 50.0, categoria: 'Salão de Beleza', status: true },
    { nome: 'Barba', duracao: 20, preco: 20.0, categoria: 'Barbearia', status: true },
    { nome: 'Hidratação Capilar', duracao: 60, preco: 70.0, categoria: 'Salão de Beleza', status: true },
    { nome: 'Progressiva', duracao: 120, preco: 150.0, categoria: 'Salão de Beleza', status: true },
    { nome: 'Sobrancelha', duracao: 15, preco: 15.0, categoria: 'Salão de Beleza', status: true },
    { nome: 'Pintura de Cabelo', duracao: 90, preco: 100.0, categoria: 'Barbearia', status: true },
  ];


  await servicoRepo.save(servicos);
  console.log('Serviços inseridos com sucesso!');

  enum Fidelidade {
    Regular = 'Regular',
    Premium = 'Premium',
    VIP = 'VIP',
  }

  const clientes = [
    {
      nome: 'João Silva',
      telefone: '11999999999',
      email: 'joao.silva@email.com',
      fidelidade: Fidelidade.Regular,
    },
    {
      nome: 'Maria Oliveira',
      telefone: '21988888888',
      email: 'maria.oliveira@email.com',
      fidelidade: Fidelidade.Premium,
    },
    {
      nome: 'Carlos Santos',
      telefone: '31977777777',
      email: 'carlos.santos@email.com',
      fidelidade: Fidelidade.VIP,
    },
  ];

  await clienteRepo.save(clientes);
  console.log('Clientes inseridos com sucesso!');

  await app.close();
}

export async function runSeeds() {
  await bootstrap();
}
