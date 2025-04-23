import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from 'src/agendamento/entities/agendamento.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('Database connection settings:');
        console.log('Host:', config.get<string>('DB_HOST'));
        console.log('Port:', config.get<number>('DB_PORT'));
        console.log('Username:', config.get<string>('DB_USER'));
        console.log('Password:', config.get<string>('DB_PASSWORD'));
        console.log('Database:', config.get<string>('DB_NAME'));
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [Agendamento, Feedback],
          synchronize: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
