// src/whatsapp/menu.service.ts
import { Injectable } from '@nestjs/common';
import { Whatsapp } from '@wppconnect-team/wppconnect';

@Injectable()
export class MenuService {
  constructor() {}

  async sendWelcomeMenu(client: Whatsapp, from: string) {
    await client.sendListMessage(from, {
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
              rowId: 'consulta',
              title: 'Consultar agendamentos',
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
