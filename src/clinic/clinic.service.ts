import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
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

      const hashedPassword = await bcrypt.hash('Admin123*', 10);

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
      | 5️⃣ Obtener rol ADMIN
      |--------------------------------------------------------------------------
      */

      const adminRole = await tx.role.findUnique({
        where: { name: 'ADMIN' },
      });

      if (!adminRole) {
        throw new BadRequestException('Rol ADMIN no existe');
      }

      /*
      |--------------------------------------------------------------------------
      | 6️⃣ Crear usuario administrador de la clínica
      |--------------------------------------------------------------------------
       */

      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          roleId: adminRole.id,
          clinicId: clinic.id,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          address: dto.address,
        },
      });

      return {
        message: 'Clínica creada correctamente 🚀',
        clinic,
      };
    });
  }

  findAll(user: any) {
    return this.prisma.clinic.findMany( {where: { status: ClinicStatus.ACTIVE}});
  }

  async findOne(id: string, user: any) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clínica no encontrada');
    }

    // 🔥 Si es ADMIN, solo puede ver su propia clínica
    if (user.role === 'ADMIN' && user.clinicId !== id) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta clínica',
      );
    }

    return clinic;
  }

   async update(id: string, dto: any, user: any) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clínica no encontrada');
    }

    // 🔥 ADMIN solo puede editar su clínica
    if (user.role === 'ADMIN' && user.clinicId !== id) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta clínica',
      );
    }

if (user.role === 'ADMIN') {
  delete dto.plan;
  delete dto.status;
}

 const {
    adminEmail,
    adminPassword,
    ...clinicData
  } = dto;
    return this.prisma.clinic.update({
      where: { id },
      data: clinicData,
    });
  }

  async remove(id: string, user: any) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clínica no encontrada');
    }

    // 🔥 Solo SUPER_ADMIN puede eliminar
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta clínica',
      );
    }

    // 🟢 OPCIÓN RECOMENDADA: Soft delete
    return this.prisma.clinic.update({
      where: { id },
      data: {
        status: ClinicStatus.SUSPENDED,
      },
    });

    // ❌ Hard delete (no recomendado en SaaS)
    // return this.prisma.clinic.delete({ where: { id } });
  }
}
