// feedback.flow.ts (atualizado com sendListMessage)
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';
import { WhatsappService } from '../whatsapp.service';

export async function handleFeedbackFlow(
  client: Whatsapp,
  sessionManager: SessionManager,
  from: string,
  message: string,
  selectedRowId: string,
): Promise<boolean> {
  const currentState = sessionManager.getState(from);

  if (
    !currentState.toString().startsWith('FEEDBACK_') &&
    message.toLowerCase() !== 'feedback'
  ) {
    return false;
  }

  switch (currentState) {
    case ConversationState.FEEDBACK_AVALIACAO:
      await handleAvaliacao(
        client,
        from,
        sessionManager,
        message,
        selectedRowId,
      );
      return true;

    case ConversationState.FEEDBACK_COMENTARIO:
      await handleComentario(
        client,
        from,
        sessionManager,
        message,
        selectedRowId,
      );
      return true;

    default:
      await iniciarFeedback(client, from, sessionManager);
      return true;
  }
}

async function iniciarFeedback(
  client: Whatsapp,
  from: string,
  sessionManager: SessionManager,
) {
  await client.sendListMessage(from, {
    title: 'Avaliação do Serviço',
    description: 'Como você avalia seu último atendimento?',
    buttonText: 'Opções de Avaliação',
    sections: [
      {
        title: 'Selecione uma nota',
        rows: [
          {
            rowId: '5',
            title: '⭐️⭐️⭐️⭐️⭐️ Excelente',
            description: 'Atendimento excepcional',
          },
          {
            rowId: '4',
            title: '⭐️⭐️⭐️⭐️ Bom',
            description: 'Atendimento muito bom',
          },
          {
            rowId: '3',
            title: '⭐️⭐️⭐️ Regular',
            description: 'Atendimento razoável',
          },
          {
            rowId: '2',
            title: '⭐️⭐️ Ruim',
            description: 'Atendimento abaixo do esperado',
          },
          {
            rowId: '1',
            title: '⭐️ Péssimo',
            description: 'Atendimento muito ruim',
          },
          {
            rowId: '0',
            title: 'Voltar',
            description: 'Voltar para o menu principal',
          },
        ],
      },
    ],
  });

  sessionManager.setState(from, ConversationState.FEEDBACK_AVALIACAO);
}

async function handleAvaliacao(
  client: Whatsapp,
  from: string,
  sessionManager: SessionManager,
  message: string,
  selectedRowId: string,
) {
  // Extrai a avaliação (pode vir como "5" ou "⭐️⭐️⭐️⭐️⭐️ Excelente")
  const avaliacao = selectedRowId ?? message.split(' ')[0].replace(/\D/g, '');
  const nota = parseInt(avaliacao);

  if (nota === 0) {
    // Usuário escolheu voltar
    await client.sendListMessage(from, {
      title: 'Barbearia XXX',
      description: 'Olá! Bem-vindo ao nosso atendimento. 😊',
      sections: [
        {
          title: '',
          rows: [
            {
              rowId: 'horarios',
              title: 'Horario de funcionamento',
              description: '',
            },
            {
              rowId: 'agendar',
              title: 'Agendar horário',
              description: 'Agende seu horário com facilidade!',
            },
            {
              rowId: 'meus-agendamentos',
              title: 'Meus agendamentos',
              description: '',
            },
            {
              rowId: 'feedback',
              title: 'Feedback',
              description: '',
            },
            {
              rowId: 'hoje',
              title: 'Agenda do dia',
              description: 'Veja os horários disponíveis para hoje!',
            },
          ],
        },
      ],
      buttonText: 'Selecione uma opção',
    });
    sessionManager.setState(from, ConversationState.NONE); // Reseta o estado
    return;
  }

  if (isNaN(nota) || nota < 1 || nota > 5) {
    await client.sendText(
      from,
      'Avaliação inválida. Por favor, escolha uma opção válida.',
    );
    await iniciarFeedback(client, from, sessionManager);

    return;
  }

  // Armazena a avaliação
  sessionManager.updateData(from, { nota });

  // Pergunta se deseja adicionar um comentário usando lista interativa
  await client.sendListMessage(from, {
    title: 'Comentário Adicional',
    description:
      'Gostaria de adicionar algum comentário sobre seu atendimento? (Opcional)',
    buttonText: 'Escolha uma opção',
    sections: [
      {
        title: 'Opções',
        rows: [
          {
            rowId: 'sim',
            title: '✅ Sim, quero comentar',
            description: 'Enviar um comentário adicional',
          },
          {
            rowId: 'nao',
            title: '❌ Não, apenas a nota',
            description: 'Enviar apenas a avaliação',
          },
        ],
      },
    ],
  });

  sessionManager.setState(from, ConversationState.FEEDBACK_COMENTARIO);
}

async function handleComentario(
  client: Whatsapp,
  from: string,
  sessionManager: SessionManager,
  message: string,
  selectedRowId: string,
) {
  const feedbackData = sessionManager.getData(from);
  let comentario = '';

  // Verifica se o usuário quer adicionar comentário
  if (
    selectedRowId == 'sim' ||
    message.toLowerCase() === 'sim' ||
    message === '✅ sim'
  ) {
    await client.sendText(from, 'Por favor, digite seu comentário:');
    return; // Mantém no mesmo estado para receber o comentário
  } else if (
    selectedRowId == 'nao' ||
    message.toLowerCase() === 'nao' ||
    message === '❌ não'
  ) {
    // Não quer comentário, finaliza o feedback
    await finalizarFeedback(
      client,
      from,
      sessionManager,
      feedbackData.nota,
      '',
    );
    return;
  } else {
    // Se já está no estado de comentário e enviou outra coisa, assume que é o comentário
    comentario = message;
  }

  // Finaliza com o comentário
  await finalizarFeedback(
    client,
    from,
    sessionManager,
    feedbackData.nota,
    comentario,
  );
  sessionManager.setState(from, ConversationState.NONE); // Reseta o estado
}

async function finalizarFeedback(
  client: Whatsapp,
  from: string,
  sessionManager: SessionManager,
  nota: number,
  comentario: string,
) {
  // Aqui você salvaria no banco de dados
  // await database.salvarFeedback({ from, nota, comentario });

  // Mapeia nota para emojis
  const estrelas = '⭐️'.repeat(nota) ;

  let mensagem =
    `Obrigado pelo seu feedback! ${estrelas}\n\n` +
    `Avaliação: ${nota} estrela${nota !== 1 ? 's' : ''}\n`;

  if (comentario) {
    mensagem += `Seu comentário: "${comentario}"\n\n`;
  }

  mensagem += `Sua opinião é muito importante para nós!`;

  await client.sendText(from, mensagem);

  // Limpa a sessão
  sessionManager.resetState(from);
}
