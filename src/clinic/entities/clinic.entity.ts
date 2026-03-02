import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  Length,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PlanType, ClinicStatus } from '@prisma/client';

export class CreateClinicDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  // Solo SUPER_ADMIN debería poder enviar esto
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  licenseExpiresAt?: Date;

  // Datos del admin inicial
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  adminEmail: string;

  @IsString()
  @Length(8, 100)
  adminPassword: string;
}