import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServicosModule } from './servicos/servicos.module';
import { ClientesModule } from './clientes/clientes.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    // Configuração do módulo de variáveis de ambiente (deve vir primeiro)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ServicosModule,
    ClientesModule,
    FeedbackModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
