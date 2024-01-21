import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';


const httpsOptions = {
  key: fs.readFileSync('./certificat/transcendence.key'),
  cert: fs.readFileSync('./certificat/transcendence.crt'),
};


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    allowedHeaders: ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With',
      'Authorization'],
    origin: ['https://localhost:4200', 'https://api.intra.42.fr'],
    // credentials: true,
  });
  await app.listen(3000);
}
bootstrap();

// origin: [ 'https://localhost:4200', 'https://localhost:3000' ],
