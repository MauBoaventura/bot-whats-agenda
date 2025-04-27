// feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  // Registrar um novo feedback
  async create(dados: Partial<Feedback>): Promise<Feedback> {
    const novoFeedback = this.feedbackRepository.create(dados);
    return await this.feedbackRepository.save(novoFeedback);
  }

  // Listar todos os feedbacks
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackRepository.find();
  }

  // Buscar um feedback por ID
  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
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
    return await this.feedbackRepository.save(feedback);
  }

  // Remover um feedback
  async remove(id: number): Promise<void> {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
  }
}
