import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { SeedModule } from './seed/seed.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicModule } from './clinic/clinic.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 MUY IMPORTANTE
    }),
    SeedModule,
    PrismaModule,
    ClinicModule,
    AuthModule,
    UserModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
