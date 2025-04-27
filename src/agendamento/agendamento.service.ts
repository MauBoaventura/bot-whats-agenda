// src/agendamento/agendamento.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';

@Injectable()
export class AgendamentoService {
  private agendamentoRepo: Repository<Agendamento>;

  constructor(private dataSource: DataSource) {
    this.agendamentoRepo = dataSource.getRepository(Agendamento);
  }

  async criarAgendamento(dados: {
    clienteTelefone: string;
    servico: string;
    data: Date;
    horario: string;
  }) {
    const novoAgendamento = this.agendamentoRepo.create(dados);
    return await this.agendamentoRepo.save(novoAgendamento);
  }
  async buscarAgendamentosPorTelefone(telefone: string) {
    return this.agendamentoRepo.find({
      where: {
        clienteTelefone: telefone,
        status: Not(In(['cancelado', 'concluido'])),
      },
      order: { data: 'ASC', horario: 'ASC' },
    });
  }
  async cancelarAgendamento(id: string): Promise<void> {
    await this.agendamentoRepo.update(id, { status: 'cancelado' });
  }
  findAll(): Promise<Agendamento[]> {
    throw new Error('Method not implemented.');
  }
  create(body: Partial<Agendamento>) {
    throw new Error('Method not implemented.');
  }
  remove(id: number) {
    throw new Error('Method not implemented.');
  }
  findOne(id: number): Promise<Agendamento> {
    throw new Error('Method not implemented.');
  }
  update(id: number, body: Partial<Agendamento>) {
    throw new Error('Method not implemented.');
  }
}
