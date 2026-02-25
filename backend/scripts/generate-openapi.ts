/**
 * Generates openapi.json from the NestJS Swagger document.
 * Run with: npx ts-node -r tsconfig-paths/register scripts/generate-openapi.ts
 * Or after build: node -r dist/scripts/generate-openapi.js (if compiled)
 *
 * Requires DATABASE_* env (or .env) so TypeORM can connect during app bootstrap.
 * Alternatively, get the spec at runtime: GET http://localhost:3000/openapi.json
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiErrorDto } from '../src/common/dto/api-error.dto';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = new DocumentBuilder()
    .setTitle('BG Hub API')
    .setDescription('Board game collection, wishlist, play logs and social features.')
    .setVersion('0.0.2')
    .addServer('http://localhost:3000', 'Local development')
    .addTag('Health', 'Liveness and readiness')
    .addTag('Auth', 'Signup, login and current user')
    .addTag('Games', 'Game catalog and search')
    .addTag('Me', 'Current user\'s owned, wishlist, plays and follow graph (requires JWT)')
    .addTag('Users', 'Public user profiles and viewed user\'s collection/wishlist')
    .addTag('Search', 'Global search (games and users)')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorDto],
  });
  const outPath = join(__dirname, '..', 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log('Wrote', outPath);
  await app.close();
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
