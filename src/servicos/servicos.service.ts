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

  async create(data: Partial<Servico>) {
    // apagar o campo id se ele estiver presente no objeto data
    if (data.id) {
      delete data.id;
    }
    // Validação de dados (opcional, dependendo do seu caso de uso)
    if (!data.nome || !data.preco) {
      throw new Error('Nome e preço são obrigatórios');
    }
    // Verifica se o serviço já existe
    const servicoExistente = await this.servicoRepo.findOne({
      where: { nome: data.nome },
    });
    if (servicoExistente) {
      throw new Error('Serviço já existe');
    }
    const servico = this.servicoRepo.create(data);
    return this.servicoRepo.save(servico);
  }

  async remove(id: number) {
    return this.servicoRepo.softDelete(id);
  }
  
  async findOne(id: number): Promise<Servico> {
    return this.servicoRepo.findOneOrFail({ where: { id } });
  }

  async update(id: number, data: Partial<Servico>) {
    await this.servicoRepo.update(id, data);
    return this.findOne(id); 
  }
}
