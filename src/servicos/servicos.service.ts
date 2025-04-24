import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servico } from './entities/servico.entity';

@Injectable()
export class ServicosService {
  constructor(
    @InjectRepository(Servico)
    private servicoRepo: Repository<Servico>,
  ) {}

  findAll() {
    return this.servicoRepo.find();
  }

  create(data: Partial<Servico>) {
    const servico = this.servicoRepo.create(data);
    return this.servicoRepo.save(servico);
  }

  async remove(id: number) {
    return this.servicoRepo.softDelete(id);
  }
}
