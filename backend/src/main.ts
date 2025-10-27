import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './infrastructure/interface/common/config/config';
import { HttpExceptionFilter } from './infrastructure/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
 
  app.useGlobalFilters(new HttpExceptionFilter());

 app.enableCors({
  origin: [
    'http://localhost:4200',                                         
    'https://portal-de-capacitaciones-production.up.railway.app',  
    'https://diplomatic-optimism-production.up.railway.app',  
    /https:\/\/.*\.railway\.app$/                                    
  ],
  credentials: true,
});

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', 
        description: 'Ingrese su token JWT (sin la palabra "Bearer")', 
        in: 'header',
      },
      'JWT-auth', 
    ) 
    .build();
 
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
 
  await app.listen(app.get(configuration.KEY).PORT);
  console.log(`API corriendo en http://localhost:${app.get(configuration.KEY).PORT}`);
  console.log(`Swagger UI en http://localhost:${app.get(configuration.KEY).PORT}/api`);
}
bootstrap();
