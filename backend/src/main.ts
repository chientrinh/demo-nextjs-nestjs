import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Global prefix: /api
  app.setGlobalPrefix('api');

  // Cookie parser cho refresh token
  app.use(cookieParser());

  // CORS configuration
  const allowedOrigins = configService
    .getOrThrow<string>('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim());

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

  // Swagger Documentation: /api/docs (chỉ bật ở development)
  if (configService.getOrThrow<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Bistro Revenue & Labour API')
      .setDescription('Hệ thống quản lý doanh thu và chi phí nhân công nhà hàng Bistro')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
  console.log(`Backend server is running on port ${port}`);
  if (configService.getOrThrow<string>('NODE_ENV') !== 'production') {
    console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  }
}

await bootstrap();
