import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import helmet from 'helmet'
import compression from 'compression'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get(ConfigService)
  /* ===========================
    🔐 Seguridad básica
  =========================== */
console.log('JWT_SECRET:', process.env.JWT_SECRET);
  app.use(helmet())
  app.use(compression())

  /* ===========================
    🌍 CORS
  =========================== */

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || '*',
    credentials: true,
  })

  /* ===========================
    📦 Prefijo global API
  =========================== */

  app.setGlobalPrefix('api/v1')

  /* ===========================
    🧠 Validación global DTO
  =========================== */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no permitidos
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  /* ===========================
    📄 Swagger (Docs API)
  =========================== */

  const swaggerConfig = new DocumentBuilder()
  .setTitle('CareFlow API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

    
    const document = SwaggerModule.createDocument(app, swaggerConfig)

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
      SwaggerModule.setup('docs', app, document)
    }
  /* ===========================
    🚀 Puerto Railway
  =========================== */

  app.set('trust proxy', 1)

  const port = configService.get<number>('PORT') || 3000
  await app.listen(port)

  console.log(`🚀 Server running on port ${port}`)
}
bootstrap();
