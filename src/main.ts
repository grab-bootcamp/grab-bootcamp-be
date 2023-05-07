import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  const configService = app.get(ConfigService);
  
  // app.enableCors();
  // app.use(helmet());
  
  const port = configService.get('PORT');
  
  await app.listen(port);
}
bootstrap();
