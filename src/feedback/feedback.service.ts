// feedback.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  private feedbackRepo: Repository<Feedback>;

  constructor(private dataSource: DataSource) {
    this.feedbackRepo = dataSource.getRepository(Feedback);
  }

  async registrarFeedback(dados: {
    clienteTelefone: string;
    nota: number;
    comentario?: string;
    data: Date;
  }) {
    const novoFeedback = this.feedbackRepo.create(dados);
    return await this.feedbackRepo.save(novoFeedback);
  }
}
