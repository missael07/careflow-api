import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SeedService {
    constructor(private prisma: PrismaService) {}

    async runSeed() {
        // Crear roles si no existen
        const roles = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'ASSISTANT']

        for (const roleName of roles) {
        await this.prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        })
        }

        // Crear clínica demo
        const clinic = await this.prisma.clinic.upsert({
        where: { name: 'Clínica Demo' },
        update: {},
        create: { name: 'Clínica Demo' },
        })

        // Obtener rol admin
        const adminRole = await this.prisma.role.findUnique({
        where: { name: 'ADMIN' },
        })

        // Crear usuario admin demo
        await this.prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            password: '123456', // ⚠️ luego lo hasheamos
            roleId: adminRole!.id,
            clinicId: clinic.id,
        },
        })

        return {
        message: 'Seed ejecutado correctamente',
        }
    }
}
