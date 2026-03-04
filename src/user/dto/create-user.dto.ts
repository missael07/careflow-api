import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {

  @ApiProperty({ example: 'doctor@clinic.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Password123*' })
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiProperty({ example: 'role-uuid-id' })
  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  // 🔥 PROFILE
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