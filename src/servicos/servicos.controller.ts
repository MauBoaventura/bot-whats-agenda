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
import { ServicosService } from './servicos.service';
import { Servico } from './entities/servico.entity';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  findAll(): Promise<Servico[]> {
    return this.servicosService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Servico>) {
    return this.servicosService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicosService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Servico> {
    return this.servicosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Servico>,
  ) {
    return this.servicosService.update(id, body);
  }
}
