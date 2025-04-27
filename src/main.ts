import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const { runSeeds } = await import('./seed');
    console.log('Rodando seeds automaticamente...');
    await runSeeds();
  }
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
