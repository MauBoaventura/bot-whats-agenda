import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
          synchronize: true,
          logging: config.get('TYPEORM_LOGGING') === 'true',
          dropSchema: config.get('TYPEORM_DROP_SCHEMA') === 'true',  // Alterado
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
