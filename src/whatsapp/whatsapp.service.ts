/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit } from '@nestjs/common';

// Extending the Message type to include listResponse
declare module '@wppconnect-team/wppconnect' {
  interface Message {
    listResponse?: ListResponse;
  }
  interface ListResponse {
    $$unknownFieldCount: number
    title: string
    listType: number
    singleSelectReply: SingleSelectReply
    description: string
  }
  
  interface SingleSelectReply {
    $$unknownFieldCount: number
    selectedRowId: string
  }
}
import { SocketState, Whatsapp, create } from '@wppconnect-team/wppconnect';
import { SessionManager } from './session.manager';
import { ConversationState } from './flows/conversation-state.enum';
import { handleAgendamentoFlow } from './flows/agendamento.flow';
import axios from 'axios';
import { handleFlow } from './flows';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Whatsapp;
  private sessionManager = new SessionManager();

  async onModuleInit() {
    try {
      this.client = await create({
        session: 'meu-bot',
        catchQR: (base64Qr, asciiQR) => console.log(asciiQR),
      });
      this.initializeListeners();
    } catch (error) {
      console.error('Erro ao inicializar o cliente WhatsApp:', error);
    }
  }

  private initializeListeners() {
    this.client.onMessage(async (message) => {
      const { from, body, isGroupMsg } = message;
      const selectedRowId = message.listResponse?.singleSelectReply.selectedRowId || ''; // Adicionando selectedRowId aqui
      if (!body || isGroupMsg) return;

      const trimmed = body.trim();

      // Primeiro tenta tratar com os flows específicos
      const handled = await handleFlow(
        this.client,
        this.sessionManager,
        from,
        trimmed,
        selectedRowId,
      );
      if (handled) return;

      // Se não foi tratado por nenhum flow, trata como mensagem padrão
      await this.sendWelcomeMessage(from);
    });
    this.client.onStateChange((state) => {
      if (state === SocketState.CONFLICT) {
        this.client.useHere().catch(console.error);
      }
    });
  }

  public async sendWelcomeMessage(from: string) {
    await this.client.sendListMessage(from, {
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
  }
}
