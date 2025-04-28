import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  async findByDate(@Query('date') date: string) {
    return this.agendaService.findByDate(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaService.findOne(+id);
  }

  @Patch(':id')
  async updateAgenda(
    @Param('id') id: number,
    @Body() updateAgendaDto: UpdateAgendaDto,
  ) {
    return this.agendaService.update(id, updateAgendaDto);
  }

  @Put(':id')
  async updateAgendaStatus(
    @Param('id') id: number,
    @Body() updateAgendaDto: UpdateAgendaDto,
  ) {
    return this.agendaService.update(id, updateAgendaDto);
  }
}
