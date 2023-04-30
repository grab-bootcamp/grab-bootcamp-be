import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors();
  app.use(helmet());
  
  const port = configService.get('PORT');
  
  await app.listen(port);
  
  const env = configService.get('NODE_ENV');
  // Send ready signal to PM2
  if (env === 'production') {
    process.send('ready');
  }
}
bootstrap();
