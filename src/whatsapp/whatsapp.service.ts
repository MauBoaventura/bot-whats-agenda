/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit } from '@nestjs/common';

// Extending the Message type to include listResponse
declare module '@wppconnect-team/wppconnect' {
  interface Message {
    listResponse?: ListResponse;
  }
  interface ListResponse {
    $$unknownFieldCount: number;
    title: string;
    listType: number;
    singleSelectReply: SingleSelectReply;
    description: string;
  }

  interface SingleSelectReply {
    $$unknownFieldCount: number;
    selectedRowId: string;
  }
}
import { SocketState, Whatsapp, create } from '@wppconnect-team/wppconnect';
import { SessionManager } from './session.manager';

import { FlowFactory } from './flows';
import { MenuService } from './flows/menu.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Whatsapp;
  private sessionManager = new SessionManager();

  constructor(
    private readonly flowFactory: FlowFactory,
    private readonly menuService: MenuService,
  ) {}

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
      const selectedRowId =
        message.listResponse?.singleSelectReply.selectedRowId || ''; // Adicionando selectedRowId aqui
      if (!body || isGroupMsg) return;

      const trimmed = body.trim();

      // Primeiro tenta tratar com os flows específicos
      const handled = await this.flowFactory.handleFlow(
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
    await this.menuService.sendWelcomeMenu(this.client, from);
  }
}
