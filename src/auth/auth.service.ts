import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        clinic: true,
      },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isActive)
      throw new ForbiddenException('Usuario inactivo');

    // Si pertenece a clínica, validar licencia
    if (user.clinic) {
      if (user.clinic.status !== 'ACTIVE') {
        throw new ForbiddenException('Clínica inactiva');
      }

      if (
        user.clinic.licenseExpiresAt &&
        user.clinic.licenseExpiresAt < new Date()
      ) {
        throw new ForbiddenException('Licencia vencida');
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      clinicId: user.clinicId ?? null,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}