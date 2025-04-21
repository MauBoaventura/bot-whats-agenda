// flow.factory.ts
import { Injectable } from '@nestjs/common';
import { ConversationState } from './conversation-state.enum';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { AgendamentoFlow } from './agendamento.flow';
import { ConsultaFlow } from './consulta.flow';
import { FeedbackFlow } from './feedback.flow';
import { HorarioFlow } from './horario.flow';

@Injectable()
export class FlowFactory {
  constructor(
    private readonly agendamentoFlow: AgendamentoFlow,
    private readonly consultaFlow: ConsultaFlow,
    private readonly feedbackFlow: FeedbackFlow,
    private readonly horarioFlow: HorarioFlow,
  ) {}

  async handleFlow(
    client: Whatsapp,
    sessionManager: SessionManager,
    from: string,
    message: string,
    selectedRowId: string,
  ): Promise<boolean> {
    const currentState = sessionManager.getState(from);

    // Verifica se está em algum flow específico
    if (currentState.toString().startsWith('AGENDAMENTO_')) {
      return this.agendamentoFlow.handleAgendamentoFlow(
        client,
        sessionManager,
        from,
        message,
        selectedRowId,
      );
    }

    if (currentState.toString().startsWith('CONSULTA_')) {
      return this.consultaFlow.handleConsultaFlow(
        client,
        sessionManager,
        from,
        message,
        selectedRowId,
      );
    }

    if (currentState.toString().startsWith('FEEDBACK_')) {
      return this.feedbackFlow.handleFeedbackFlow(
        client,
        sessionManager,
        from,
        message,
        selectedRowId,
      );
    }

    // Verifica comandos iniciais
    switch (selectedRowId) {
      case 'horarios':
        sessionManager.setState(from, ConversationState.HORARIO_FUNCIONAMENTO);
        return this.horarioFlow.handleHorarioFlow(
          client,
          sessionManager,
          from,
          message,
          selectedRowId,
        );

      case 'agendar':
      case 'agendar horário':
        sessionManager.setState(
          from,
          ConversationState.AGENDAMENTO_ESCOLHER_SERVICO,
        );
        return this.agendamentoFlow.handleAgendamentoFlow(
          client,
          sessionManager,
          from,
          message,
          selectedRowId,
        );

      case 'consulta':
        sessionManager.setState(from, ConversationState.CONSULTA_AGENDAMENTOS);
        return this.consultaFlow.handleConsultaFlow(
          client,
          sessionManager,
          from,
          message,
          selectedRowId,
        );

      case 'feedback':
        sessionManager.setState(from, ConversationState.FEEDBACK_MENU);
        return this.feedbackFlow.handleFeedbackFlow(
          client,
          sessionManager,
          from,
          message,
          selectedRowId,
        );

      default:
        return false;
    }
  }
}
