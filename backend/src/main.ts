import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  // Fail-fast validate JWT secrets
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT_SECRET và JWT_REFRESH_SECRET là bắt buộc trong biến môi trường');
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('JWT_SECRET và JWT_REFRESH_SECRET phải khác nhau để đảm bảo an toàn');
  }

  const app = await NestFactory.create(AppModule);

  // Global prefix: /api
  app.setGlobalPrefix('api');

  // Cookie parser cho refresh token
  app.use(cookieParser());

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global ExceptionFilter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation: /api/docs
  const config = new DocumentBuilder()
    .setTitle('Bistro Revenue & Labour API')
    .setDescription('Hệ thống quản lý doanh thu và chi phí nhân công nhà hàng Bistro')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`Backend server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

await bootstrap();
