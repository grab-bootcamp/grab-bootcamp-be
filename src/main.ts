import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet())

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port);

  // Send ready signal to PM2 on production
  const env = configService.get('NODE_ENV');
  if (env === 'production') {
    process.send('ready');
  }
}
bootstrap();
