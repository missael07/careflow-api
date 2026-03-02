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

      const roles = ['SUPER_ADMIN', 'ADMIN_CLINIC', 'DOCTOR', 'ASSISTANT'];

      for (const roleName of roles) {
        await tx.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName },
        });
      }

      /*
       |--------------------------------------------------------------------------
       | 2️⃣ Clínica demo
       |--------------------------------------------------------------------------
       */

      const clinic = await tx.clinic.upsert({
        where: { email: 'demo@careflow.com' },
        update: {},
        create: {
          name: 'Clínica Demo CareFlow',
          email: 'demo@careflow.com',
          status: ClinicStatus.ACTIVE,
          plan: PlanType.PRO,
          licenseExpiresAt: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ),
        },
      });

      /*
       |--------------------------------------------------------------------------
       | 3️⃣ Obtener roles
       |--------------------------------------------------------------------------
       */

      const superAdminRole = await tx.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
      });

      const adminClinicRole = await tx.role.findUnique({
        where: { name: 'ADMIN_CLINIC' },
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
       | 5️⃣ Admin de clínica
       |--------------------------------------------------------------------------
       */

      await tx.user.upsert({
        where: {
            email: 'admin@demo.com',
        },
        update: {},
        create: {
          email: 'admin@demo.com',
          password: hashedPassword,
          roleId: adminClinicRole!.id,
          clinicId: clinic.id,
        },
      });

      return {
        message: 'Seed ejecutado correctamente 🚀',
      };
    });
  }
}