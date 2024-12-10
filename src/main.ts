import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { AppModule } from './app.module';

async function ConnectDatabase() {
  const prisma = new PrismaClient();

  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

(async () => {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3008;
  const corsOptions = {
    origin: ['http://localhost:3000', 'https://invosan.com'], // Desteklenen originler
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // İzin verilen HTTP yöntemleri
    allowedHeaders: ['Content-Type', 'Authorization'], // Gerekli başlıklar
    credentials: true, // Oturum bilgilerini iletmek için
  };

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(corsOptions);

  await app.listen(port);
  await ConnectDatabase();
})();
