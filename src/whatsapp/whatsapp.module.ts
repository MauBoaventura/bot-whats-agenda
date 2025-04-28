import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import {
  AgendamentoFlow,
  ConsultaFlow,
  FeedbackFlow,
  FlowFactory,
} from './flows';
import { HorarioFlow } from './flows/horario.flow';
import { FeedbackModule } from '../feedback/feedback.module'; // <-- importa o módulo
import { MenuService } from './flows/menu.service';
import { AgendamentoModule } from '../agendamento/agendamento.module';

@Module({
  imports: [FeedbackModule, AgendamentoModule],
  providers: [
    WhatsappService,
    FlowFactory,
    AgendamentoFlow,
    ConsultaFlow,
    FeedbackFlow,
    HorarioFlow,
    MenuService,
  ],
  controllers: [WhatsappController],
  exports: [FlowFactory, MenuService],
})
export class WhatsappModule {}
