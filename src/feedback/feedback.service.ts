// feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  private feedbackRepo: Repository<Feedback>;

  constructor(private dataSource: DataSource) {
    this.feedbackRepo = dataSource.getRepository(Feedback);
  }

  // Registrar um novo feedback
  async create(dados: Partial<Feedback>): Promise<Feedback> {
    const novoFeedback = this.feedbackRepo.create(dados);
    return await this.feedbackRepo.save(novoFeedback);
  }

  // Listar todos os feedbacks
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackRepo.find();
  }

  // Buscar um feedback por ID
  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback com ID ${id} não encontrado`);
    }
    return feedback;
  }

  // Atualizar um feedback
  async update(
    id: number,
    dadosAtualizados: Partial<Feedback>,
  ): Promise<Feedback> {
    const feedback = await this.findOne(id);
    Object.assign(feedback, dadosAtualizados);
    return await this.feedbackRepo.save(feedback);
  }

  // Remover um feedback
  async remove(id: number): Promise<void> {
    const feedback = await this.findOne(id);
    await this.feedbackRepo.remove(feedback);
  }
}
