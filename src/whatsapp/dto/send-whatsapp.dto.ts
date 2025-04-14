// src/whatsapp/dto/send-whatsapp.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class SendWhatsappDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
