// horario.flow.ts
import { Injectable } from '@nestjs/common';
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { SessionManager } from '../session.manager';
import { ConversationState } from './conversation-state.enum';

@Injectable()
export class HorarioFlow {
  private readonly HORARIOS_FUNCIONAMENTO = `
🕒 *Horário de Funcionamento* 🕒
  
Segunda a Sexta: 09:00 - 19:00
Sábado: 09:00 - 17:00
Domingo: Fechado

*Horário de Almoço*: 12:00 - 13:30
`;

  async handleHorarioFlow(
    client: Whatsapp,
    sessionManager: SessionManager,
    from: string,
    message: string,
    selectedRowId: string,
  ): Promise<boolean> {
    const currentState = sessionManager.getState(from);

    if (
      !currentState.toString().startsWith('HORARIO_') &&
      message.toLowerCase() !== 'horarios' &&
      selectedRowId !== 'horarios'
    ) {
      return false;
    }

    await this.mostrarHorarios(client, from, sessionManager);
    return true;
  }

  private async mostrarHorarios(
    client: Whatsapp,
    from: string,
    sessionManager: SessionManager,
  ) {
    await client.sendListMessage(from, {
      title: 'Horários de Funcionamento',
      description: this.HORARIOS_FUNCIONAMENTO,
      buttonText: 'Opções',
      sections: [
        {
          title: 'O que deseja fazer?',
          rows: [
            {
              rowId: 'agendar',
              title: '📅 Agendar Horário',
              description: 'Iniciar um novo agendamento',
            },
            {
              rowId: 'voltar',
              title: '↩️ Voltar ao Menu',
              description: 'Retornar ao menu principal',
            },
          ],
        },
      ],
    });

    sessionManager.setState(from, ConversationState.NONE);
  }

  public async getHorariosFuncionamento(): Promise<string> {
    return this.HORARIOS_FUNCIONAMENTO;
  }
}
