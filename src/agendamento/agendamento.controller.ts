import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    Param,
    ParseIntPipe,
    Put,
} from '@nestjs/common';
import { AgendamentoService } from './agendamento.service';
import { Agendamento } from './entities/agendamento.entity';

@Controller('agendamento')
export class AgendamentoController {
    constructor(private readonly agendamentoService: AgendamentoService) {}

    @Get()
    findAll(): Promise<Agendamento[]> {
        return this.agendamentoService.findAll();
    }

    @Post()
    create(@Body() body: Partial<Agendamento>) {
        return this.agendamentoService.create(body);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.agendamentoService.remove(id);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Agendamento> {
        return this.agendamentoService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: Partial<Agendamento>,
    ) {
        return this.agendamentoService.update(id, body);
    }
}
