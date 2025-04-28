import { PartialType } from '@nestjs/mapped-types';
import { CreateAgendamentoDto } from './create-agendamento.dto';

export class UpdateAgendaDto extends PartialType(CreateAgendamentoDto) {}
