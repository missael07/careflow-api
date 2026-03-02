import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { SeedModule } from './seed/seed.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 MUY IMPORTANTE
    }),
    SeedModule,
    PrismaModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
