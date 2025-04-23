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
  private qrCodeBase64: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isSessionActive = false;

  constructor(
    private readonly flowFactory: FlowFactory,
    private readonly menuService: MenuService,
  ) {}

  async onModuleInit() {
    this.initSession();
  }

  async initSession() {
    try {
      this.client = await create({
        session: 'meu-bot',
        autoClose: 0, // Desativa o auto close automático
        puppeteerOptions: {
          // headless: false, // Mantém visível para depuração
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        },
        catchQR: (base64Qrimg, asciiQR) => {
          this.qrCodeBase64 = base64Qrimg;
          this.reconnectAttempts = 0; // Reset ao receber novo QR
          console.log('Novo QR Code disponível:', asciiQR);
          console.log('QR Code Base64:', base64Qrimg);
        },
        waitForLogin: true // Espera até que o login seja concluído
      });

      this.initializeListeners();
      this.setupSessionHandlers();
      this.isSessionActive = true;

    } catch (error) {
      console.error('Erro ao inicializar o cliente WhatsApp:', error);
      await this.handleSessionError();
    }
  }

private setupSessionHandlers() {
  this.client.onStateChange((state) => {
    console.log('Mudança de estado:', state);
    if (state === 'CONNECTED') {
      this.reconnectAttempts = 0;
      this.isSessionActive = true;
      console.log('Autenticado com sucesso!');
    } else if (['CONFLICT', 'UNPAIRED', 'UNLAUNCHED'].includes(state)) {
      this.isSessionActive = false;
      this.handleSessionError();
    }
  });

  this.client.onStreamChange((state) => {
    console.log('Stream alterado:', state);
    if (state === 'DISCONNECTED') {
      this.isSessionActive = false;
      this.handleSessionError();
    }
  });

}


  private async handleSessionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        if (this.client) {
          await this.client.close();
        }
        await this.initSession();
      } catch (error) {
        console.error('Erro na tentativa de reconexão:', error);
      }
    } else {
      console.error('Número máximo de tentativas de reconexão alcançado');
    }
  }

  private initializeListeners() {
    this.client.onMessage(async (message) => {
      const { from, body, isGroupMsg } = message;
      const selectedRowId =
        message.listResponse?.singleSelectReply.selectedRowId || '';
      if (!body || isGroupMsg) return;

      const trimmed = body.trim();

      const handled = await this.flowFactory.handleFlow(
        this.client,
        this.sessionManager,
        from,
        trimmed,
        selectedRowId,
      );
      if (handled) return;

      await this.sendWelcomeMessage(from);
    });

    this.client.onStateChange((state) => {
      console.log('Mudança de estado do socket:', state);
      if (state === SocketState.CONFLICT) {
        this.client.useHere().catch(console.error);
      }
    });
  }

  public async sendWelcomeMessage(from: string) {
    await this.menuService.sendWelcomeMenu(this.client, from);
  }

  public getQrCodeBase64(): string | null {
    return this.qrCodeBase64;
  }

  public getQrCodeImageBuffer(): Buffer | null {
    if (!this.qrCodeBase64) return null;
    return Buffer.from(this.qrCodeBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
  }

  public async logout() {
    try {
      if (this.client) {
        await this.client.logout();
        this.isSessionActive = false;
        console.log('Deslogado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  }

  public async getStatus() {
    try {
      if (!this.client) {
        return Error('Cliente WhatsApp não inicializado');
      }
      
      const status = await this.client.getConnectionState();
      console.log('Status do WhatsApp:', status);
      return {
        status,
        isAuthenticated: this.isSessionActive,
        qrGenerated: !!this.qrCodeBase64,
        reconnectAttempts: this.reconnectAttempts
      };
    } catch (error) {
      console.error('Erro interno:', error);
      throw error;
    }
  }

  public isActive(): boolean {
    return this.isSessionActive;
  }
}
