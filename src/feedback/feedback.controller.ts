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
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll(): Promise<Feedback[]> {
    return this.feedbackService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Feedback>) {
    return this.feedbackService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Feedback> {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Feedback>,
  ) {
    return this.feedbackService.update(id, body);
  }
}
