import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';

export async function handleAgendamentoFlow(
  client: Whatsapp,
  sessionManager: SessionManager,
  from: string,
  message: string,
): Promise<boolean> {
  const session = sessionManager.getSession(from);

  switch (session.state) {
    case ConversationState.AGENDANDO_DATA:
      session.data.date = message;
      session.state = ConversationState.AGENDANDO_HORARIO;
      sessionManager.setSession(from, session);

      await client.sendText(from, '🕐 Agora informe o horário desejado:');
      return true;

    case ConversationState.AGENDANDO_HORARIO: {
      session.data.time = message;

      const { date, time } = session.data;
      await client.sendText(
        from,
        `✅ Consulta agendada para ${date} às ${time}.`,
      );
      sessionManager.clearSession(from);
      return true;
    }

    default:
      return false;
  }
}
