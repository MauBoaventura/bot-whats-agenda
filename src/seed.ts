// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Servico } from './servicos/entities/servico.entity';
import { Cliente } from './clientes/entities/cliente.entity';
import { Agendamento } from './agendamento/entities/agendamento.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const servicoRepo = dataSource.getRepository(Servico);
  const clienteRepo = dataSource.getRepository(Cliente);
  const agendamentoRepo = dataSource.getRepository(Agendamento);

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

  const agendamentos = [
    {
      clienteTelefone: '558695441013@c.us',
      clienteNome: clientes[0].nome,
      servico: servicos[0], // Primeiro serviço da lista
      dataHora: new Date(new Date().setHours(10, 0, 0)), // Hoje às 10:00
      confirmado: true,
    },
    {
      clienteTelefone: '558695441013@c.us',
      clienteNome: clientes[1].nome,
      servico: servicos[1], // Segundo serviço da lista
      dataHora: new Date(new Date().setDate(new Date().getDate() + 1)), // Amanhã às 14:00
      confirmado: false,
    },
  ];
  await agendamentoRepo.save(agendamentos);
  console.log('Agendamentos inseridos com sucesso!');
  await app.close();
}

export async function runSeeds() {
  await bootstrap();
}
