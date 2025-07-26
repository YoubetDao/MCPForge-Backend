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

  // 配置CORS支持credentials - 允许 netlify.app 域名
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // 基础允许的域名列表
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://localhost:3000',
        'https://localhost:3001',
        process.env.FRONTEND_URL,
      ].filter(Boolean); // 过滤掉 undefined 值

      // 从环境变量添加额外的允许域名
      if (process.env.ADDITIONAL_FRONTEND_URLS) {
        const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
        allowedOrigins.push(...additionalUrls);
      }

      console.log(`🌐 CORS check for origin: ${origin}`);

      // 如果没有 origin（比如移动端应用或 Postman），允许访问
      if (!origin) {
        console.log('✅ No origin - allowing access');
        return callback(null, true);
      }

      // 使用正则表达式检查域名模式
      const allowedDomainPatterns = [
        /^https?:\/\/.*\.netlify\.app$/,     // *.netlify.app
        /^https?:\/\/.*\.vercel\.app$/,      // *.vercel.app
        /^https?:\/\/.*\.github\.io$/,       // *.github.io
        /^https?:\/\/.*\.surge\.sh$/,        // *.surge.sh
      ];

      // 从环境变量添加自定义域名模式
      if (process.env.ALLOWED_DOMAIN_PATTERNS) {
        const customPatterns = process.env.ALLOWED_DOMAIN_PATTERNS.split(',').map(pattern => {
          try {
            return new RegExp(pattern.trim());
          } catch (e) {
            console.warn(`⚠️ Invalid regex pattern: ${pattern}`);
            return null;
          }
        }).filter(Boolean);
        allowedDomainPatterns.push(...customPatterns);
      }

      const isAllowedByPattern = allowedDomainPatterns.some(pattern => pattern.test(origin));
      if (isAllowedByPattern) {
        console.log('✅ Domain matches allowed pattern - allowing access');
        return callback(null, true);
      }

      // 检查是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Origin in allowed list - allowing access');
        return callback(null, true);
      }

      // 开发环境允许所有 localhost 和 127.0.0.1
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          console.log('✅ Development localhost - allowing access');
          return callback(null, true);
        }
      }

      console.log('❌ Origin not allowed:', origin);
      console.log('📋 Allowed origins:', allowedOrigins);
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
