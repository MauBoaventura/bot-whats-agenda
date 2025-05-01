/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import * as FormData from 'form-data';

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
import { saveAudioFromBase64 } from 'src/utils/converteParaAudio';

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
        folderNameToken: 'tokens',
        autoClose: 0, // Desativa o auto close automático
        puppeteerOptions: {
          // headless: false, // Mantém visível para depuração
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
          ],
        },
        catchQR: (base64Qrimg, asciiQR) => {
          this.qrCodeBase64 = base64Qrimg;
          this.reconnectAttempts = 0; // Reset ao receber novo QR
          console.log('Novo QR Code disponível:', asciiQR);
          console.log('QR Code Base64:', base64Qrimg);
        },
        waitForLogin: true, // Espera até que o login seja concluído
      });

      this.initializeListeners();
      this.setupSessionHandlers();
      this.isSessionActive = true;
    } catch (error) {
      console.error('Erro ao inicializar o cliente WhatsApp:', error);
      // await this.handleSessionError();
    }
  }

  private setupSessionHandlers() {
    this.client.onStateChange((state) => {
      if (state === 'CONNECTED') {
        this.reconnectAttempts = 0;
        this.isSessionActive = true;
        return;
      } else if (['CONFLICT', 'UNPAIRED', 'UNLAUNCHED'].includes(state)) {
        this.isSessionActive = false;
        this.handleSessionError();
      }
    });

    this.client.onStreamChange((state) => {
      if (state === 'DISCONNECTED') {
        this.isSessionActive = false;
        this.handleSessionError();
      }
    });
  }

  private async handleSessionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      await new Promise((resolve) => setTimeout(resolve, 5000));

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

      if (message.type === 'ptt') {
        await this.processAudioMessage(message);
        return;
      }

      const selectedRowId = message.listResponse?.singleSelectReply.selectedRowId || '';
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
      if (state === SocketState.CONFLICT) {
        this.client.useHere().catch(console.error);
      }
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        this.client.useHere(); // Força a sessão para o seu cliente
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
    return Buffer.from(
      this.qrCodeBase64.replace(/^data:image\/png;base64,/, ''),
      'base64',
    );
  }

  public async logout() {
    try {
      if (this.client) {
        await this.client.logout();
        this.isSessionActive = false;
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
      return {
        status,
        isAuthenticated: this.isSessionActive,
        qrGenerated: !!this.qrCodeBase64,
        reconnectAttempts: this.reconnectAttempts,
      };
    } catch (error) {
      console.error('Erro interno:', error);
      throw error;
    }
  }

  public isActive(): boolean {
    return this.isSessionActive;
  }

  private async processAudioMessage(message: any) {
    try {
      const mediaBase64 = await this.client.downloadMedia(message);
      if (mediaBase64) {
        const savePathOgg = await saveAudioFromBase64(mediaBase64, String(message.timestamp));

        // Faz a requisição para o serviço de transcrição
        const formData = new FormData();
        formData.append('audio_file', fs.createReadStream(savePathOgg), {
          filename: 'oggFilename',
          contentType: 'audio/ogg',
        });

        const apiUrl = process.env.TRANSCRIPTION_API_URL;

        const response = await axios.post(
          `${apiUrl}/asr?encode=true&task=transcribe&language=pt&output=txt`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        );

        await this.client.sendText(message.from, response.data);

        // Remove o arquivo de áudio após o envio
        fs.unlinkSync(savePathOgg);
      } else {
        console.warn('⚠️ Não foi possível baixar o áudio');
      }
    } catch (error) {
      console.error('❌ Erro ao processar o áudio:', error);
    }
  }
}
