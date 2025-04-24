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
import { AgendamentoService } from '../agendamento/agendamento.service';
import { FeedbackService } from '../feedback/feedback.service';
import { MenuService } from './flows/menu.service';

@Module({
  providers: [
    WhatsappService,
    FlowFactory,
    AgendamentoFlow,
    ConsultaFlow,
    FeedbackFlow,
    HorarioFlow,
    AgendamentoService,
    FeedbackService,
    MenuService,
  ],
  controllers: [WhatsappController],
  exports: [FlowFactory, MenuService],
})
export class WhatsappModule {}
