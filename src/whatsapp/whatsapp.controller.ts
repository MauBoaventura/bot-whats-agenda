// src/whatsapp/whatsapp.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {
  }

  @Get('qrcode')
  getQrCodeImage(@Res() res: Response) {
    const imageBuffer = this.whatsappService.getQrCodeImageBuffer();

    if (!imageBuffer) {
      return res.status(404).json({ error: 'QR Code ainda não gerado' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }

  @Get('qrcode-base64')
  getQrCodeBase64() {
    const base64 = this.whatsappService.getQrCodeBase64();

    if (!base64) {
      return { error: 'QR Code ainda não gerado' };
    }

    return { qrCode: base64 };
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    try {
      await this.whatsappService.logout();
      return res.status(200).json({ message: 'Deslogado com sucesso' });
    } catch (error) {
      console.error('Erro ao deslogar:', error);
      return res.status(500).json({ error: 'Erro ao deslogar' });
    }
  }
  @Get('status')
  async getStatus(@Res() res: Response) {	
    try {
      const status = await this.whatsappService.getStatus();
      return res.status(200).json({ status });
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return res.status(500).json({ error: 'Erro ao obter status' });
    }
  }
  @Get('env')
  async getEnv(@Res() res: Response) {	
    try {
      console.log('Configuração do banco de dados:', {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        logging: process.env.TYPEORM_LOGGING === 'true',
        dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true',
        config: process.env.PORT,
      });
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return res.status(500).json({ error: 'Erro ao obter status' });
    }
  }
}
