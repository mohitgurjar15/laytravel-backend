import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import *as config from 'config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestExceptionFilter } from "./bad-request-exception.filter";
import { NotFoundExceptionFilter } from "./not-found-exception.filter";
import { UnauthorizedExceptionFilter } from "./unauthorized-exception.filter";
import { ConflictExcepionFilter } from "./conflict-exception.filter";
import * as Sentry from '@sentry/node';
import { InternalServerErrorExceptionFilter } from './internal-server-exception.filter';
import { ForbiddenExceptionFilter } from './forbidden-resources-exception.filter';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const serverConfig = config.get('server');
  const sentryConfig = config.get('Sentry');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new BadRequestExceptionFilter());
	app.useGlobalFilters(new ConflictExcepionFilter());
	app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalFilters(new InternalServerErrorExceptionFilter());
  app.useGlobalFilters(new ForbiddenExceptionFilter());
  
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Lay Trip')
    .setDescription('')
    .setVersion('1.0')
    .build();
    const document = SwaggerModule.createDocument(app, options);
    Sentry.init({
      dsn: process.env.DSN || sentryConfig.DSN,
    });
    SwaggerModule.setup('api-docs', app, document);
    app.enableCors();
    
    const port = process.env.PORT || serverConfig.port;
    app.useStaticAssets(path.join(__dirname, '/../assets'));
    
    await app.listen(port);
  }

bootstrap();