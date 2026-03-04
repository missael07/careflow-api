import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, currentUser: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    if (currentUser.role === 'ADMIN') {
      dto.clinicId = currentUser.clinicId;
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          roleId: dto.roleId,
          clinicId: dto.clinicId ?? null,
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

      return user;
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        clinic: true,
        profile: true,
      },
    });
  }

  findAll(user: any) {
    const prisma = this.prisma.withTenant(user.clinicId, user.role);
    return prisma.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            clinicId: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }


    // 🔥 SUPER_ADMIN puede todo
    if (currentUser.role !== 'SUPER_ADMIN') {
      if(currentUser.role == 'ADMIN' &&
        profile.user.clinicId !== currentUser.clinicId){
        throw new ForbiddenException('Acceso denegado');
      } else if (
        currentUser.role !== 'ADMIN' &&
        profile.user.id !== currentUser.sub
      ) {
        throw new ForbiddenException('Acceso denegado');
      }
    }

    const { clinicId, email,roleId, password, ...profileData } = dto;
    return this.prisma.profile.update({
      where: { userId: id },
      data: profileData,
      include: {
        user: {
        include: {
          clinic: true,
          role: true
        },
      },        
      }
    });
  }

  async remove(id: string, currentUser: any) {
        const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // 🔥 SUPER_ADMIN puede todo
    if (currentUser.role !== 'SUPER_ADMIN') {
      if(currentUser.role === 'ADMIN' &&
        user.clinicId !== currentUser.clinicId
      || user.id === currentUser.sub){
        throw new ForbiddenException('Acceso denegado');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false
      },
      include: {
        clinic: true,
        role: true,
        profile: true
      },
    });
  }
}
