import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as fs from "fs";
import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  let app: INestApplication;

  try {
    // 尝试读取 SSL 证书
    const httpsOptions = {
      key: fs.readFileSync("ssl/private.key"),
      cert: fs.readFileSync("ssl/certificate.crt"),
    };

    // 如果证书存在，使用 HTTPS
    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });
    console.log("Server running with HTTPS");
  } catch {
    // 如果证书不存在，使用 HTTP
    app = await NestFactory.create(AppModule);
    console.log("Server running with HTTP");
  }

  const config = new DocumentBuilder()
    .setTitle("MCPForge API")
    .setDescription("The API description for MCPForge backend")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  // 简化 CORS 配置 - 默认支持 netlify.app 和 localhost
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // 如果没有 origin（Postman、移动端等），允许访问
      if (!origin) {
        return callback(null, true);
      }

      // 允许所有 localhost 和 127.0.0.1（开发环境）
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // 允许所有 netlify.app 和 vercel.app 域名
      if (origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 拒绝其他域名
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  // 配置Cookie解析中间件
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);

  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);
}
bootstrap();
