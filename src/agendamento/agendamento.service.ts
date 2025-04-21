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
}
