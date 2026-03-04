import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('clinic')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}


@Post()
@Roles('SUPER_ADMIN')
create(
  @Body() createClinicDto: CreateClinicDto,
  @CurrentUser() user: User,
) {
  return this.clinicService.create(createClinicDto, user);
}

  // 🔥 SOLO SUPER_ADMIN
  @Get()
  @Roles('SUPER_ADMIN')
  findAll(@CurrentUser() user: User) {
    return this.clinicService.findAll(user);
  }

  // 🔥 SUPER_ADMIN o ADMIN
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.clinicService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: User,
  ) {
    return this.clinicService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.clinicService.remove(id, user);
  }
}
