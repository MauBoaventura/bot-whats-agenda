import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServicosModule } from './servicos/servicos.module';
import { ClientesModule } from './clientes/clientes.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AgendaModule } from './agenda/agenda.module';
import { ProfissionalModule } from './profissional/profissional.module';

@Module({
  imports: [
    // Configuração do módulo de variáveis de ambiente (deve vir primeiro)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '../.env' : '.env',
    }),
    DatabaseModule,
    ServicosModule,
    ClientesModule,
    FeedbackModule,
    WhatsappModule,
    AgendaModule,
    ProfissionalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
