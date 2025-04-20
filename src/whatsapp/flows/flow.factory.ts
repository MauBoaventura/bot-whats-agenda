// flow.factory.ts
import { ConversationState } from './conversation-state.enum';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { handleAgendamentoFlow } from './agendamento.flow';
import { handleConsultaFlow } from './consulta.flow';
import { handleFeedbackFlow } from './feedback.flow';

export async function handleFlow(
  client: Whatsapp,
  sessionManager: SessionManager,
  from: string,
  message: string,
  selectedRowId: string,
): Promise<boolean> {
  const currentState = sessionManager.getState(from);
  
  // Verifica se está em algum flow específico
  if (currentState.toString().startsWith('AGENDAMENTO_')) {
    return handleAgendamentoFlow(client, sessionManager, from, message);
  }
  
  if (currentState.toString().startsWith('CONSULTA_')) {
    return handleConsultaFlow(client, sessionManager, from, message);
  }
  
  if (currentState.toString().startsWith('FEEDBACK_')) {
    return handleFeedbackFlow(client, sessionManager, from, message, selectedRowId);
  }
  // Verifica comandos iniciais
  switch (selectedRowId) {
    case 'agendar':
    case 'agendar horário':
      sessionManager.setState(from, ConversationState.AGENDAMENTO_ESCOLHER_SERVICO);
      return handleAgendamentoFlow(client, sessionManager, from, message);
    
    case 'meus agendamentos':
    case 'meus-agendamentos':
      sessionManager.setState(from, ConversationState.CONSULTA_AGENDAMENTOS);
      return handleConsultaFlow(client, sessionManager, from, message);
    
    case 'feedback':
      sessionManager.setState(from, ConversationState.FEEDBACK_MENU);
      return handleFeedbackFlow(client, sessionManager, from, message, selectedRowId);
    
    default:
      return false;
  }
}