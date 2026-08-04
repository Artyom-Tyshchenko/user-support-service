import 'reflect-metadata';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '*');
  app.enableCors({
    origin:
      configService.get<string>('NODE_ENV') === 'production'
        ? allowedOrigins.split(',')
        : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: 422,
  exceptionFactory: (errors) => {
     const fieldErrors: Record<string, string[]> = {};
     for (const error of errors) {
       fieldErrors[error.property] = Object.values(error.constraints ?? {});
     }
     return new UnprocessableEntityException({
       message: 'Ошибка валидации',
       errors: fieldErrors,
     });
   },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Support Service API')
    .setDescription(
      'Регистрация, авторизация и управление пользователями (роли admin/user, статус активен/заблокирован)',
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
