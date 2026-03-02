import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {

  @ApiProperty({
    example: 'admin@demo.com',
    description: 'Correo del usuario',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'Admin123*',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @Length(8, 100)
  password: string;
}