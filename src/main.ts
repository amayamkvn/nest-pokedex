import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v2');
  
  app.useGlobalPipes( 
    new ValidationPipe({
    whitelist: true, //Remueve la data que no necesitamos de la data enviada
    forbidNonWhitelisted: true, //Devuelve un error si recibimos data que no esperamos
    })
   );

  await app.listen(3000);
}
bootstrap();
