import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { Agendamento } from '../agendamento/entities/agendamento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepository: Repository<Agendamento>,
  ) {}
  async create(createAgendaDto: Agendamento): Promise<Agendamento> {
    const agenda = this.agendamentoRepository.create(createAgendaDto);
    return this.agendamentoRepository.save(agenda);
  }

  async findAll(): Promise<Agendamento[]> {
    return this.agendamentoRepository.find();
  }

  async findOne(id: number): Promise<Agendamento> {
    const agenda = await this.agendamentoRepository.findOne({ where: { id } });
    if (!agenda) {
      throw new NotFoundException(`Agenda com ID ${id} não encontrada`);
    }
    return agenda;
  }

  async update(id: number, updateAgendaDto: Partial<UpdateAgendaDto>) {
    const agenda = await this.agendamentoRepository.findOneBy({ id });
    if (!agenda) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    Object.assign(agenda, updateAgendaDto);
    return this.agendamentoRepository.save(agenda);
  }

  async remove(id: number): Promise<void> {
    const agenda = await this.findOne(id);
    await this.agendamentoRepository.softRemove(agenda);
  }

  async findByDate(date: string): Promise<Agendamento[]> {
    return this.agendamentoRepository.find({
      where: { data: Raw((alias) => `DATE(${alias}) = :date`, { date }) },
      relations: ['servico'],
      order: { horario: 'ASC' },
    });
  }
}
