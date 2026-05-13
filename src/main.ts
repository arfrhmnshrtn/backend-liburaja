import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // MATIKAN cors bawaan
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
