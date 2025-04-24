// agendamento.flow.ts
import { Injectable } from '@nestjs/common';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';
import { format, addDays, isAfter, isBefore, parseISO, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AgendamentoService } from '../../agendamento/agendamento.service';
import { MenuService } from './menu.service';

@Injectable()
export class AgendamentoFlow {
  constructor(
    private readonly agendamentoService: AgendamentoService,
    private readonly menuService: MenuService,
  ) {}

  async handleAgendamentoFlow(
    client: Whatsapp,
    sessionManager: SessionManager,
    from: string,
    message: string,
    selectedRowId: string,
  ): Promise<boolean> {
    const currentState = sessionManager.getState(from);

    if (
      !currentState.toString().startsWith('AGENDAMENTO_') &&
      !['agendar', 'agendar horário'].includes(message.toLowerCase())
    ) {
      return false;
    }

    switch (currentState) {
      case ConversationState.NONE:
      case ConversationState.AGENDAMENTO_ESCOLHER_SERVICO:
        await this.handleEscolherServico(client, from, sessionManager);
        return true;

      case ConversationState.AGENDAMENTO_ESCOLHER_DATA:
        await this.handleEscolherData(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      case ConversationState.AGENDAMENTO_ESCOLHER_HORARIO:
        await this.handleEscolherHorario(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      case ConversationState.AGENDAMENTO_CONFIRMAR:
        await this.handleConfirmacao(
          client,
          from,
          sessionManager,
          message,
          selectedRowId,
        );
        return true;

      case ConversationState.AGENDAMENTO_PROCESSAR_CONFIRMAR:
        await this.processarConfirmacaoFinal(
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

  private async handleEscolherServico(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
  ) {
    const servicos = [
      { id: 'corte', title: 'Corte de Cabelo' },
      { id: 'barba', title: 'Corte de Barba' },
      { id: 'completo', title: 'Corte Completo (Cabelo + Barba)' },
    ];

    await client.sendListMessage(from, {
      title: 'Escolha o serviço',
      description: 'Por favor, selecione o serviço desejado:',
      buttonText: 'Serviços',
      sections: [
        {
          title: 'Serviços Disponíveis',
          rows: servicos.map((servico) => ({
            rowId: servico.id,
            title: servico.title,
            description: '',
          })),
        },
      ],
    });

    sessionManager.setState(from, ConversationState.AGENDAMENTO_ESCOLHER_DATA);
    sessionManager.setData(from, { servicos });
  }

  private async handleEscolherData(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const servicoEscolhido = selectedRowId ?? message.toLowerCase();
    const servicosDisponiveis = sessionManager.getData(from).servicos;

    const servicoValido = servicosDisponiveis.find(
      (s: { id: string }) => s.id === servicoEscolhido,
    );

    if (!servicoValido) {
      await client.sendText(
        from,
        'Opção inválida. Por favor, escolha um serviço da lista.',
      );
      return;
    }

    sessionManager.updateData(from, { servicoEscolhido });

    const hoje = new Date();
    const opcoesData: { id: string; title: string; description: string }[] = [];

    for (let i = 1; i <= 7; i++) {
      const data = addDays(hoje, i);
      if (data.getDay() !== 0) {
        opcoesData.push({
          id: format(data, 'yyyy-MM-dd'),
          title: format(data, 'EEEE, dd/MM', { locale: ptBR }),
          description: '',
        });
      }
    }

    await client.sendListMessage(from, {
      title: 'Escolha a data',
      description: 'Selecione uma data disponível para o agendamento:',
      buttonText: 'Datas Disponíveis',
      sections: [
        {
          title: 'Próximos Dias',
          rows: opcoesData.map((opcao) => ({
            rowId: opcao.id,
            title: opcao.title,
            description: opcao.description,
          })),
        },
      ],
    });

    sessionManager.updateData(from, { opcoesData });
    sessionManager.setState(
      from,
      ConversationState.AGENDAMENTO_ESCOLHER_HORARIO,
    );
  }

  private async handleEscolherHorario(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const sessionData = sessionManager.getData(from);
    const { servicoEscolhido } = sessionData;

    if (!servicoEscolhido) {
      await client.sendText(from, 'Por favor, selecione um serviço primeiro.');
      sessionManager.setState(
        from,
        ConversationState.AGENDAMENTO_ESCOLHER_SERVICO,
      );
      return;
    }

    const dateRegex = /(\d{2})\/(\d{2})/;
    const match = message.match(dateRegex);

    let dataSelecionada: string | null = null;

    if (match) {
      const [, dia, mes] = match;
      const ano = new Date().getFullYear();
      const data = set(new Date(), {
        year: ano,
        month: Number(mes) - 1,
        date: Number(dia),
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
      dataSelecionada = format(data, 'yyyy-MM-dd');
    } else {
      try {
        const testDate = new Date(message);
        if (!isNaN(testDate.getTime())) {
          dataSelecionada = format(testDate, 'yyyy-MM-dd');
        }
      } catch (e) {
        // Data inválida
      }
    }

    if (!dataSelecionada) {
      await client.sendText(
        from,
        'Data inválida. Por favor, escolha uma data da lista.',
      );
      return;
    }

    const horariosDisponiveis: {
      id: string;
      title: string;
      description: string;
    }[] = [];
    const horaInicio = 9;
    const horaFim = 18;

    for (let h = horaInicio; h < horaFim; h++) {
      for (let m = 0; m < 60; m += 30) {
        const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        horariosDisponiveis.push({
          id: horario,
          title: horario,
          description: '',
        });
      }
    }

    const horariosOcupados = ['10:00', '11:30', '14:00'];
    const horariosFiltrados = horariosDisponiveis.filter(
      (h) => !horariosOcupados.includes(h.id),
    );

    const dataFormatada = format(
      parseISO(dataSelecionada),
      'EEEE, dd/MM/yyyy',
      {
        locale: ptBR,
      },
    );

    await client.sendListMessage(from, {
      title: `Horários para ${dataFormatada}`,
      description: `Escolha um horário disponível para ${servicoEscolhido}:`,
      buttonText: 'Horários',
      sections: [
        {
          title: 'Horários Disponíveis',
          rows: horariosFiltrados.slice(0, 10).map((horario) => ({
            rowId: horario.id,
            title: horario.title,
            description: horario.description,
          })),
        },
      ],
    });

    sessionManager.updateData(from, {
      dataSelecionada: {
        id: dataSelecionada,
        title: dataFormatada,
      },
      horariosDisponiveis: horariosFiltrados,
    });

    sessionManager.setState(from, ConversationState.AGENDAMENTO_CONFIRMAR);
  }

  private async handleConfirmacao(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    const dataAtual = sessionManager.getData(from);
    const horariosDisponiveis = dataAtual.horariosDisponiveis || [];

    const horarioEscolhido = horariosDisponiveis.find(
      (h: { id: string; title: string }) =>
        h.id === message || h.title === message,
    );

    if (!horarioEscolhido) {
      await client.sendText(
        from,
        'Horário inválido. Por favor, escolha um horário da lista.',
      );
      return;
    }

    sessionManager.updateData(from, { horarioEscolhido });

    const { servicoEscolhido, dataSelecionada } = dataAtual;
    const resumo = `
    *Resumo do Agendamento:*

    *Serviço:* ${servicoEscolhido}
    *Data:* ${dataSelecionada.title}
    *Horário:* ${horarioEscolhido.title}

    Por favor, confirme seu agendamento:
    `;

    await client.sendListMessage(from, {
      title: 'Confirmação de Agendamento',
      description: resumo,
      buttonText: 'Escolha uma opção',
      sections: [
        {
          title: 'Opções',
          rows: [
            { rowId: 'confirmar', title: '✅ Confirmar', description: '' },
            { rowId: 'cancelar', title: '❌ Cancelar', description: '' },
          ],
        },
      ],
    });

    sessionManager.setState(
      from,
      ConversationState.AGENDAMENTO_PROCESSAR_CONFIRMAR,
    );
  }

  private async processarConfirmacaoFinal(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
    message: string,
    selectedRowId: string,
  ) {
    if (
      selectedRowId == 'confirmar' ||
      message.toLowerCase() === 'confirmar' ||
      message === '✅ confirmar'
    ) {
      const { servicoEscolhido, dataSelecionada, horarioEscolhido } =
        sessionManager.getData(from);

      // Usando o AgendamentoService para salvar no banco de dados
      await this.agendamentoService.criarAgendamento({
        clienteTelefone: from,
        servico: servicoEscolhido,
        data: parseISO(dataSelecionada.id),
        horario: horarioEscolhido.id,
      });

      await client.sendText(
        from,
        `Agendamento confirmado! ✅\n\n` +
          `*Serviço:* ${servicoEscolhido}\n` +
          `*Data:* ${dataSelecionada.title}\n` +
          `*Horário:* ${horarioEscolhido.title}\n\n` +
          `Obrigado por agendar conosco!`,
      );
      await this.menuService.sendWelcomeMenu(client, from);
    } else {
      await client.sendText(from, 'Agendamento cancelado.');
      await this.menuService.sendWelcomeMenu(client, from);
    }

    sessionManager.resetState(from);
  }
}
