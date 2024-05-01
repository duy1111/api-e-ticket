import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { setupAuth } from './setup-auth';
import { setupSwagger } from './setup-swagger';
import { HttpExceptionFilter } from './utils/http-exceptions-fillter';
import { RawBodyMiddleware } from './helpers/middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  console.log(__dirname);
  setupAuth(app);
  if (process.env.API_DOCS) {
    setupSwagger(app);
  }
  app.use(RawBodyMiddleware());

  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getHttpServer();
  server.keepAliveTimeout = 120000;

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}
bootstrap();
