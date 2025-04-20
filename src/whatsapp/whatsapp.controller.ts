// src/whatsapp/whatsapp.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendWhatsappDto } from './dto/send-whatsapp.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}
  @Get('send-to-me')
  teste() {
    return 'Funcionando!!';
  }
}
