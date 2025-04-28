import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { Profissional } from './entities/profissional.entity';

@Injectable()
export class ProfissionalService {
  constructor(
    @InjectRepository(Profissional)
    private readonly profissionalRepository: Repository<Profissional>,
  ) {}

  async create(createProfissionalDto: CreateProfissionalDto): Promise<Profissional> {
    const profissional = this.profissionalRepository.create(createProfissionalDto);
    return await this.profissionalRepository.save(profissional);
  }

  async findAll(): Promise<Profissional[]> {
    return await this.profissionalRepository.find({
      relations: ['servicos'],
    });
  }

  async findOne(id: number): Promise<Profissional> {
    const profissional = await this.profissionalRepository.findOne({
      where: { id },
      relations: ['servicos'],
    });
    
    if (!profissional) {
      throw new NotFoundException(`Profissional com ID ${id} não encontrado`);
    }
    
    return profissional;
  }

  async update(id: number, updateProfissionalDto: UpdateProfissionalDto): Promise<Profissional> {
    const profissional = await this.findOne(id);
    
    // Atualiza as propriedades do profissional com os valores do DTO
    Object.assign(profissional, updateProfissionalDto);
    
    return await this.profissionalRepository.save(profissional);
  }

  async remove(id: number): Promise<void> {
    const profissional = await this.findOne(id);
    await this.profissionalRepository.softRemove(profissional);
  }

  async findByServico(servicoId: number): Promise<Profissional[]> {
    return await this.profissionalRepository
      .createQueryBuilder('profissional')
      .innerJoin('profissional.servicos', 'servico')
      .where('servico.id = :servicoId', { servicoId })
      .andWhere('profissional.status = :status', { status: 'ativo' })
      .getMany();
  }

  async getDisponiveisPorDia(dia: number): Promise<Profissional[]> {
    return await this.profissionalRepository
      .createQueryBuilder('profissional')
      .where('profissional.status = :status', { status: 'ativo' })
      .andWhere(':dia = ANY(profissional.diasTrabalho)', { dia })
      .getMany();
  }
}
