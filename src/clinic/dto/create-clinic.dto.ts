import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  Length,
  IsDateString,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PlanType, ClinicStatus } from '@prisma/client';

export class CreateClinicDto {

  @ApiProperty({ example: 'Clínica Santa María' })
  @IsString()
  @Length(2, 80)
  name: string;

  @ApiProperty({ example: 'contacto@santamaria.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    enum: PlanType,
    example: PlanType.PRO,
    required: false,
  })
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @ApiProperty({
    enum: ClinicStatus,
    example: ClinicStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;

  @ApiProperty({
    example: '2026-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  licenseExpiresAt?: Date;

  @ApiProperty({ example: 'admin@santamaria.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  adminEmail: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '5551234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Av. Principal 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

}