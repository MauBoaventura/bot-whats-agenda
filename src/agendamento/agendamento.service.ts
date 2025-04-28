// src/agendamento/agendamento.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { Servico } from '../servicos/entities/servico.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';

@Injectable()
export class AgendamentoService {
  private agendamentoRepo: Repository<Agendamento>;
  private servicoRepo: Repository<Servico>;

  constructor(private dataSource: DataSource) {
    this.agendamentoRepo = dataSource.getRepository(Agendamento);
    this.servicoRepo = dataSource.getRepository(Servico);
  }

  async criarAgendamento(dados: {
    clienteTelefone: string;
    servico: number; // ID do serviço
    data: Date;
    horario: string;
    observacao?: string;
  }) {
    // Buscar o serviço pelo ID
    const servico = await this.servicoRepo.findOne({
      where: { id: dados.servico },
    });
    if (!servico) {
      throw new NotFoundException(
        `Serviço com ID ${dados.servico} não encontrado`,
      );
    }

    // Criar o agendamento com o serviço relacionado
    const novoAgendamento = this.agendamentoRepo.create({
      clienteTelefone: dados.clienteTelefone,
      servico, // Relacionamento com a entidade Servico
      data: dados.data,
      horario: dados.horario,
      observacao: dados.observacao,
    });

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

  async obterServicos(): Promise<Servico[]> {
    return this.servicoRepo.find({ where: { status: true } });
  }
  
  findAll(): Promise<Agendamento[]> {
    throw new Error('Method not implemented.');
  }
  async create(body: CreateAgendamentoDto) {
    try {
      console.log('body', body);
      const novoAgendamento = this.agendamentoRepo.create({
        ...body,
        servico: { id: body.servico },
        profissional: body.profissional ? { id: body.profissional } : undefined,
      });
  
      return await this.agendamentoRepo.save(novoAgendamento);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
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
