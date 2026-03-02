import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { PlanType, ClinicStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicService {

 constructor(private prisma: PrismaService) {}

  create(dto: CreateClinicDto, currentUser: any) {
    return this.prisma.$transaction(async (tx) => {
      /*
       |--------------------------------------------------------------------------
       | 1️⃣ Validar permisos
       |--------------------------------------------------------------------------
       */

      if (currentUser.role !== 'SUPER_ADMIN') {
        if (dto.plan || dto.status || dto.licenseExpiresAt) {
          throw new ForbiddenException(
            'No puedes definir plan o estado de licencia',
          );
        }
      }

      /*
       |--------------------------------------------------------------------------
       | 2️⃣ Validar fecha futura
       |--------------------------------------------------------------------------
       */

      if (dto.licenseExpiresAt) {
        if (dto.licenseExpiresAt <= new Date()) {
          throw new BadRequestException(
            'licenseExpiresAt debe ser una fecha futura',
          );
        }
      }

      /*
       |--------------------------------------------------------------------------
       | 3️⃣ Valores por defecto
       |--------------------------------------------------------------------------
       */

      const plan = dto.plan ?? PlanType.BASIC;
      const status = dto.status ?? ClinicStatus.TRIAL;

      const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

      /*
       |--------------------------------------------------------------------------
       | 4️⃣ Crear clínica
       |--------------------------------------------------------------------------
       */

      const clinic = await tx.clinic.create({
        data: {
          name: dto.name,
          email: dto.email,
          plan,
          status,
          licenseExpiresAt: dto.licenseExpiresAt ?? null,
        },
      });

      /*
       |--------------------------------------------------------------------------
       | 5️⃣ Obtener rol ADMIN_CLINIC
       |--------------------------------------------------------------------------
       */

      const adminRole = await tx.role.findUnique({
        where: { name: 'ADMIN_CLINIC' },
      });

      if (!adminRole) {
        throw new BadRequestException('Rol ADMIN_CLINIC no existe');
      }

      /*
       |--------------------------------------------------------------------------
       | 6️⃣ Crear usuario administrador de la clínica
       |--------------------------------------------------------------------------
       */

      await tx.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          roleId: adminRole.id,
          clinicId: clinic.id,
        },
      });

      return {
        message: 'Clínica creada correctamente 🚀',
        clinic,
      };
    });
  }

  findAll() {
    return `This action returns all clinic`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clinic`;
  }

  update(id: number, updateClinicDto: UpdateClinicDto) {
    return `This action updates a #${id} clinic`;
  }

  remove(id: number) {
    return `This action removes a #${id} clinic`;
  }
}
