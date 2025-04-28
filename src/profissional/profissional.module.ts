import { Module } from '@nestjs/common';
import { ProfissionalService } from './profissional.service';
import { ProfissionalController } from './profissional.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profissional } from './entities/profissional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profissional])],
  controllers: [ProfissionalController],
  providers: [ProfissionalService],
  exports: [ProfissionalService]
})
export class ProfissionalModule {}
