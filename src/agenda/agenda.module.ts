import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { AgendamentoModule } from 'src/agendamento/agendamento.module';
import { Agendamento } from '../agendamento/entities/agendamento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Agendamento])], 
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
