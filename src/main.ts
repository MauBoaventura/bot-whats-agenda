import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NgrokInterceptor } from './interceptors/ngrok.interceptor';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: '*', // ou especifique os domínios
  });
  app.useGlobalInterceptors(new NgrokInterceptor()); // Aplica a todas as rotas

  // const isDev = process.env.NODE_ENV === 'development';

  // if (isDev) {
  //   const { runSeeds } = await import('./seed');
  //   console.log('Rodando seeds automaticamente...');
  //   await runSeeds();
  // }
    
  console.log('App inicializado');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
