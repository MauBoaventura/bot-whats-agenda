// consulta.flow.ts
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';

export async function handleConsultaFlow(
  client: Whatsapp,
  sessionManager: SessionManager,
  from: string,
  message: string
): Promise<boolean> {
  const currentState = sessionManager.getState(from);

  if (!currentState.toString().startsWith('CONSULTA_') && 
      !['meus agendamentos', 'meus-agendamentos'].includes(message.toLowerCase())) {
    return false;
  }

  switch (currentState) {
    case ConversationState.CONSULTA_AGENDAMENTOS:
      await handleListarAgendamentos(client, from, sessionManager);
      return true;
    
    default:
      return false;
  }
}

async function handleListarAgendamentos(client: Whatsapp, from: string, sessionManager: SessionManager) {
  // Simulação - na prática, buscaria de um banco de dados
  const agendamentos = [
    { id: '1', data: '15/08/2023', horario: '14:00', servico: 'Corte de Cabelo' },
    { id: '2', data: '20/08/2023', horario: '16:30', servico: 'Corte Completo' }
  ];

  if (agendamentos.length === 0) {
    await client.sendText(from, 'Você não possui agendamentos marcados.');
    sessionManager.resetState(from);
    return;
  }

  await client.sendListMessage(from, {
    title: 'Seus Agendamentos',
    description: 'Seus agendamentos marcados:',
    buttonText: 'Opções',
    sections: [{
      title: 'Agendamentos',
      rows: agendamentos.map(ag => ({
        rowId: ag.id,
        title: `${ag.servico} - ${ag.data} às ${ag.horario}`,
        description: 'Clique para mais opções'
      }))
    }]
  });

  // Mantém o estado para possível cancelamento/edição
  sessionManager.setData(from, { agendamentos });
}