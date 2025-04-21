// consulta.flow.ts
import { Injectable } from '@nestjs/common';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';
import { AgendamentoService } from 'src/agendamento/agendamento.service';
import { format } from 'date-fns';
import { se, th } from 'date-fns/locale';
import { WhatsappService } from '../whatsapp.service';
import { MenuService } from './menu.service';

@Injectable()
export class ConsultaFlow {
  constructor(
    private readonly agendamentoService: AgendamentoService,
    private readonly menuService: MenuService,
  ) {}

  async handleConsultaFlow(
    client: Whatsapp,
    sessionManager: SessionManager,
    from: string,
    message: string,
    selectedRowId: string,
  ): Promise<boolean> {
    const currentState = sessionManager.getState(from);

    if (
      !currentState.toString().startsWith('CONSULTA_') &&
      !['meus agendamentos', 'meus-agendamentos'].includes(
        message.toLowerCase(),
      )
    ) {
      return false;
    }

    switch (currentState) {
      case ConversationState.CONSULTA_AGENDAMENTOS:
        await this.handleListarAgendamentos(client, from, sessionManager);
        return true;

      case ConversationState.CONSULTA_SELECIONAR_CANCELAMENTO:
        await this.handleSelecionarAgendamentoParaCancelar(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      case ConversationState.CONSULTA_CONFIRMAR_CANCELAMENTO:
        await this.handleConfirmarCancelamento(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      default:
        return false;
    }
  }

  private async handleListarAgendamentos(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
  ) {
    const agendamentos =
      await this.agendamentoService.buscarAgendamentosPorTelefone(from);

    const agendamentosFormatados = agendamentos.map((ag) => ({
      id: ag.id.toString(),
      data: format(ag.data, 'dd/MM/yyyy'),
      horario: ag.horario,
      servico: ag.servico,
    }));

    if (agendamentosFormatados.length === 0) {
      await client.sendText(from, 'Você não possui agendamentos marcados.');
      await this.menuService.sendWelcomeMenu(client, from);
      sessionManager.resetState(from);
      return;
    }

    await client.sendListMessage(from, {
      title: 'Seus Agendamentos',
      description: 'Seus agendamentos marcados:',
      buttonText: 'Opções',
      sections: [
        {
          title: 'Agendamentos',
          rows: [
            ...agendamentosFormatados.map((ag) => ({
              rowId: `cancelar_${ag.id}`,
              title: `${ag.servico} - ${ag.data} às ${ag.horario}`,
              description: 'Clique para cancelar este agendamento',
            })),
            {
              rowId: 'voltar',
              title: 'Voltar',
              description: 'Voltar para o menu principal',
            },
          ],
        },
      ],
    });

    sessionManager.setData(from, { agendamentos: agendamentosFormatados });
    sessionManager.setState(
      from,
      ConversationState.CONSULTA_SELECIONAR_CANCELAMENTO,
    );
  }

  private async handleSelecionarAgendamentoParaCancelar(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    // Verifica se a mensagem é um ID de agendamento para cancelar (começa com "cancelar_")
    if (selectedRowId === 'voltar') {
      await this.menuService.sendWelcomeMenu(client, from);
      sessionManager.resetState(from);
      return;
    }
    if (!selectedRowId.startsWith('cancelar_')) {
      await client.sendText(
        from,
        'Por favor, selecione um agendamento da lista para cancelar.',
      );
      return;
    }

    const agendamentoId = selectedRowId.split('_')[1];
    const sessionData = sessionManager.getData(from);
    const agendamento = sessionData.agendamentos.find(
      (ag) => ag.id === agendamentoId,
    );

    if (!agendamento) {
      await client.sendText(
        from,
        'Agendamento não encontrado. Por favor, tente novamente.',
      );
      sessionManager.resetState(from);
      return;
    }

    // Armazena o agendamento selecionado na sessão
    sessionManager.setData(from, {
      ...sessionData,
      agendamentoSelecionado: agendamento,
    });

    await client.sendListMessage(from, {
      title: 'Confirmação de Cancelamento',
      description: `*Serviço:* ${agendamento.servico}\n*Data:* ${agendamento.data}\n*Horário:* ${agendamento.horario}`,

      buttonText: 'Escolha uma opção',
      sections: [
        {
          title: 'Detalhes do Agendamento',
          rows: [
            {
              rowId: 'confirmar_cancelamento',
              title: 'Sim, cancelar',
              description: `Cancelar o agendamento selecionado`,
            },
            {
              rowId: 'voltar',
              title: 'Não, voltar',
              description: 'Cancelar a operação e voltar ao menu anterior',
            },
          ],
        },
      ],
    });

    sessionManager.setState(
      from,
      ConversationState.CONSULTA_CONFIRMAR_CANCELAMENTO,
    );
  }

  private async handleConfirmarCancelamento(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const sessionData = sessionManager.getData(from);
    const agendamento = sessionData.agendamentoSelecionado;

    if (!agendamento) {
      await client.sendText(
        from,
        'Ocorreu um erro. Por favor, tente novamente.',
      );
      sessionManager.resetState(from);
      return;
    }

    if (
      selectedRowId == 'confirmar_cancelamento' ||
      message === '1' ||
      message.toLowerCase() === 'sim'
    ) {
      try {
        // Cancela o agendamento no banco de dados
        await this.agendamentoService.cancelarAgendamento(agendamento.id);

        await client.sendText(
          from,
          `✅ Agendamento cancelado com sucesso!\n\n` +
            `*Serviço:* ${agendamento.servico}\n` +
            `*Data:* ${agendamento.data}\n` +
            `*Horário:* ${agendamento.horario}\n\n` +
            `Se precisar marcar um novo horário, é só chamar!`,
        );
        await this.menuService.sendWelcomeMenu(client, from);
      } catch (error) {
        await client.sendText(
          from,
          '❌ Ocorreu um erro ao cancelar o agendamento. Por favor, tente novamente mais tarde.',
        );
      }
    } else {
      await this.menuService.sendWelcomeMenu(client, from);
    }

    sessionManager.resetState(from);
  }
}
