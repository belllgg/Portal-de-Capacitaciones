import { Controller, Post, Get, Delete, Put, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserCreateService } from '../../../../application/services/users/user-create.service';
import { UserDeleteService } from '../../../../application/services/users/user-delete.service';
import { UserConsultService } from '../../../../application/services/users/user-consult.service';
import { UserUpdateService } from '../../../../application/services/users/user-update.service';
import { CreateUserDto, UserResponseDto } from '../../../../domain/users/dto/user.dto';
import { UpdateUserDto } from '../../../../domain/users/dto/user-update.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UserLoginService, LoginDto, LoginResponseDto } from '../../../../application/services/users/user-login.service';

@ApiTags('Administracion de Usuarios')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly UserCreateService: UserCreateService,
    private readonly UserConsultService: UserConsultService,
    private readonly UserDeleteService: UserDeleteService,
    private readonly UserUpdateService: UserUpdateService,
    private readonly UserLoginService: UserLoginService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar usuario y devolver sus datos' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario válido. Se devuelven los datos del usuario y el token.', 
    type: LoginResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Email o contraseña incorrectos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.UserLoginService.login(loginDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth('JWT-auth') 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' }) 
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.UserCreateService.register(createUserDto);
  }

  @Get('consult-all')
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Usuarios obtenidos exitosamente', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' }) 
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll() {
    return await this.UserConsultService.findAll();
  }

  @Get('consult:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  async findById(@Param('id') id: number) {
    return await this.UserConsultService.findById(id);
  }

  @Put('update/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un usuario por email' })
  async update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.UserUpdateService.updateByEmail(email, updateUserDto);
  }

  @Delete('delete/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario por email' })
  async delete(@Param('email') email: string) {
    return await this.UserDeleteService.deleteByEmail(email);
  }
}