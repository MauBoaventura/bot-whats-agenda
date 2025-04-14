/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SocketState, Whatsapp, create } from '@wppconnect-team/wppconnect';
import { SessionManager } from './session.manager';
import { ConversationState } from './flows/conversation-state.enum';
import { handleAgendamentoFlow } from './flows/agendamento.flow';
import axios from 'axios';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Whatsapp;
  private sessionManager = new SessionManager();

  async onModuleInit() {
    this.client = await create({
      session: 'meu-bot',
      catchQR: (base64Qr, asciiQR) => console.log(asciiQR),
    });

    this.initializeListeners();
  }

  private initializeListeners() {
    this.client.onAnyMessage(async (message) => {
      const { from, body, isGroupMsg } = message;
      if (!body || isGroupMsg || from !== '15550714762@c.us') return;
      const trimmed = body.trim();

      const handled = await handleAgendamentoFlow(
        this.client,
        this.sessionManager,
        from,
        trimmed,
      );
      if (handled) return;

      switch (trimmed) {
        case '1':
          this.sessionManager.setSession(from, {
            state: ConversationState.AGENDANDO_DATA,
            data: {},
          });
          await this.client.sendText(
            from,
            '📅 Qual a data desejada para o agendamento?',
          );
          break;
        case '2':
          await this.client.sendText(
            from,
            '📖 Agenda:\n- Segunda: 10h\n- Quarta: 14h',
          );
          break;
        case '3':
          await this.client.sendText(from, '🛠 Encaminhando para o suporte...');
          break;
        case '4':
          await this.client.sendText(
            from,
            'ℹ️ Atendimento das 8h às 18h, de segunda a sexta.',
          );
          break;
        default:
          await this.client.sendText(
            from,
            `Olá! Escolha uma opção:\n1 - Agendar consulta\n2 - Ver agenda\n3 - Suporte\n4 - Informações`,
          );
      }
    });

    this.client.onStateChange((state) => {
      if (state === SocketState.CONFLICT) {
        this.client.useHere().catch(console.error);
      }
    });
  }

  async sendMessageToMe(message: string): Promise<{ [key: string]: any }> {
    const apiUrl = 'https://graph.facebook.com/v22.0';
    const phoneNumberId = '113262701745938'; // Substitua pelo ID do número de telefone
    const token =
      'EAAIXmOZAPwwIBO42dKQYv32U3sZAeMYpM7WUnZCcr5UiRTw4PeybWjYGU68SPnaDGDVL41xNMWBtdTtfqcbvVVhQDaIxuKNwZCECZBBZAADGA7wcAaCviKarnH5COaCD0G2DIhZC3WkZB1S0vPmTNXDnwBwE9lZANURLhnQAeTF2PZA82Nhqh1YjGLViMpRZCMAvERloVbUxhchGR0937n9jf6BNSsLoU8ZD';
    const recipientNumber = '5586995441013'; // Substitua pelo número de telefone do destinatário

    const url = `${apiUrl}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientNumber,
      type: 'text',
      text: {
        body: message,
      },
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, payload, { headers });
    return response.data as { [key: string]: any };
  }
}
