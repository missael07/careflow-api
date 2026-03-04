import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, ClinicStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async runSeed() {
    const hashedPassword = await bcrypt.hash('Admin123*', 10);

    return this.prisma.$transaction(async (tx) => {
      /*
       |--------------------------------------------------------------------------
       | 1️⃣ Roles
       |--------------------------------------------------------------------------
       */

      const roles = ['SUPER_ADMIN', 'ADMIN', 'INTERNAL', 'EXTERNAL'];
      
      for (const roleName of roles) {
        await tx.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName },
        });
      }


      /*
       |--------------------------------------------------------------------------
       | 3️⃣ Obtener rol
       |--------------------------------------------------------------------------
       */

      const superAdminRole = await tx.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
      });

      /*
       |--------------------------------------------------------------------------
       | 4️⃣ Super Admin
       |--------------------------------------------------------------------------
       */

      await tx.user.upsert({
        where: {
          email: 'superadmin@careflow.com',
        },
        update: {},
        create: {
          email: 'superadmin@careflow.com',
          password: hashedPassword,
          roleId: superAdminRole!.id,
        },
      });

      /*
       |--------------------------------------------------------------------------
       | 4️⃣ Super Admin Profile
       |--------------------------------------------------------------------------
       */

       const superAdmin = await tx.user.findUnique({
        where: { email: 'superadmin@careflow.com' },
      });

      await tx.profile.create({
        data: {
          userId: superAdmin!.id,
          firstName: 'Missael',
          lastName: 'Padilla',
          phone: '6862487608',
          address: 'Rio Salvador 1953 Valle Dorado 21399',
        },
      });


      return {
        message: 'Seed ejecutado correctamente 🚀',
      };

    });
  }
}