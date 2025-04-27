// feedback.flow.ts
import { Injectable } from '@nestjs/common';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';
import { FeedbackService } from '../../feedback/feedback.service';
import { MenuService } from './menu.service';

@Injectable()
export class FeedbackFlow {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly menuService: MenuService,
  ) {}

  async handleFeedbackFlow(
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
        await this.handleAvaliacao(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      case ConversationState.FEEDBACK_COMENTARIO:
        await this.handleComentario(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      default:
        await this.iniciarFeedback(client, from, sessionManager);
        return true;
    }
  }

  private async iniciarFeedback(
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

  private async handleAvaliacao(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const avaliacao = selectedRowId ?? message.split(' ')[0].replace(/\D/g, '');
    const nota = parseInt(avaliacao);

    if (nota === 0) {
      await this.voltarParaMenuPrincipal(client, from, sessionManager);
      return;
    }

    if (isNaN(nota) || nota < 1 || nota > 5) {
      await client.sendText(
        from,
        'Avaliação inválida. Por favor, escolha uma opção válida.',
      );
      await this.iniciarFeedback(client, from, sessionManager);
      return;
    }

    sessionManager.updateData(from, { nota });

    await this.solicitarComentario(client, from, sessionManager);
  }

  private async voltarParaMenuPrincipal(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
  ) {
    this.menuService.sendWelcomeMenu(client, from);

    sessionManager.setState(from, ConversationState.NONE);
  }

  private async solicitarComentario(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
  ) {
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

  private async handleComentario(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const feedbackData = sessionManager.getData(from);
    let comentario = '';

    if (
      selectedRowId == 'sim' ||
      message.toLowerCase() === 'sim' ||
      message === '✅ sim'
    ) {
      await client.sendText(from, 'Por favor, digite seu comentário:');
      return;
    } else if (
      selectedRowId == 'nao' ||
      message.toLowerCase() === 'nao' ||
      message === '❌ não'
    ) {
      await this.finalizarFeedback(
        client,
        from,
        sessionManager,
        feedbackData.nota,
        '',
      );
      return;
    } else {
      comentario = message;
    }

    await this.finalizarFeedback(
      client,
      from,
      sessionManager,
      feedbackData.nota,
      comentario,
    );
  }

  private async finalizarFeedback(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    nota: number,
    comentario: string,
  ) {
    try {
      // Salva o feedback no banco de dados
      await this.feedbackService.create({
        clienteTelefone: from,
        nota,
        comentario,
        data: new Date(),
      });

      const estrelas = '⭐️'.repeat(nota);
      let mensagem =
        `Obrigado pelo seu feedback! ${estrelas}\n\n` +
        `Avaliação: ${nota} estrela${nota !== 1 ? 's' : ''}\n`;

      if (comentario) {
        mensagem += `Seu comentário: "${comentario}"\n\n`;
      }

      mensagem += `Sua opinião é muito importante para nós!`;

      await client.sendText(from, mensagem);
      await this.menuService.sendWelcomeMenu(client, from);

      sessionManager.resetState(from);
    } catch (error) {
      console.error('Erro ao processar feedback:', error);
      await client.sendText(
        from,
        'Ocorreu um erro inesperado ao processar seu feedback. Por favor, tente novamente mais tarde.',
      );
      await this.menuService.sendWelcomeMenu(client, from);
      sessionManager.resetState(from);
    }
  }
}
