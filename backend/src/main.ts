import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorDto } from './common/dto/api-error.dto';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import express from 'express';

const SCALAR_HTML = `<!DOCTYPE html>
<html>
<head><title>BG Hub API</title></head>
<body>
  <script id="api-reference" data-url="/openapi.json"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(uploadsDir));
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BG Hub API')
    .setDescription('Board game collection, wishlist, play logs and social features.')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local development')
    .addTag('Health', 'Liveness and readiness')
    .addTag('Auth', 'Signup, login and current user')
    .addTag('Games', 'Game catalog and search')
    .addTag('Me', 'Current user’s owned, wishlist, plays and follow graph (requires JWT)')
    .addTag('Users', 'Public user profiles')
    .addTag('Search', 'Global search (games and users)')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorDto],
  });
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/openapi.json', (_req: unknown, res: unknown) =>
    (res as { json: (body: unknown) => void }).json(document),
  );
  httpAdapter.get('/docs', (_req: unknown, res: unknown) => {
    const r = res as { setHeader: (n: string, v: string) => void; send: (body: string) => void };
    r.setHeader('Content-Type', 'text/html');
    r.send(SCALAR_HTML);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
