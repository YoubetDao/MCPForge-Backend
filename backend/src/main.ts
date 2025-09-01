import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  let app: INestApplication;

  try {
    // 尝试读取 SSL 证书
    const httpsOptions = {
      key: fs.readFileSync('ssl/private.key'),
      cert: fs.readFileSync('ssl/certificate.crt'),
    };

    // 如果证书存在，使用 HTTPS
    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });
    console.log('Server running with HTTPS');
  } catch {
    // 如果证书不存在，使用 HTTP
    app = await NestFactory.create(AppModule);
    console.log('Server running with HTTP');
  }

  const config = new DocumentBuilder()
    .setTitle('MCPForge API')
    .setDescription('The API description for MCPForge backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 允许所有域名跨域访问
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'Cache-Control',
      'cache-control',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'User-Agent',
      'Referer',
      'Origin',
      'Connection',
      'Upgrade-Insecure-Requests',
      'If-Modified-Since',
      'If-None-Match',
      'Pragma',
      'Sec-Fetch-Dest',
      'Sec-Fetch-Mode',
      'Sec-Fetch-Site',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  // 配置Cookie解析中间件
  app.use(cookieParser() as any);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);

  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);
}
bootstrap();
