import { Controller, Get, Post, Put, Delete,Body, Param, ParseIntPipe,HttpCode,HttpStatus,UseGuards} from '@nestjs/common';
import { ModuleConsultService } from '../../../../application/services/module-category/module-consult.service';
import { ModuleCreateService } from '../../../../application/services/module-category/module-create.service';
import { ModuleUpdateService } from '../../../../application/services/module-category/module-update.service';
import { ModuleDeleteService } from '../../../../application/services/module-category/module-delete.service';
import { CreateModuleDto,ModuleResponseDto,UpdateModuleDto } from '../../../../domain/modules-category/dto/module-category.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Administracion de Modulos')
@Controller('api/modules')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth') 
export class ModulesController {
  constructor(
    private readonly moduleConsultService: ModuleConsultService,
    private readonly ModuleCreateService: ModuleCreateService,
    private readonly ModuleUpdateService: ModuleUpdateService,
    private readonly ModuleDeleteService: ModuleDeleteService,


  ) {}


   @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo modulo' })
  @ApiBody({
    type: CreateModuleDto,
    examples: {
      ejemplo1: {
        summary: 'Registro básico',
        value: {
          name: 'React',
          description: 'USER',
          icon: 'USER',

        },
      },
         },
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: ModuleResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' }) 
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createModuleDto: CreateModuleDto) {
    return await this.ModuleCreateService.create(createModuleDto);
  }
  @Get('consult-all')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.moduleConsultService.findAll();
  }

  @Get('contult-stats')
  @HttpCode(HttpStatus.OK)
  async findAllWithStats() {
    return await this.moduleConsultService.findAllWithStats();
  }

  @Get('consult-simple')
  @HttpCode(HttpStatus.OK)
  async findAllSimple() {
    return await this.moduleConsultService.findAllSimple();
  }

  @Get('consult:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.moduleConsultService.findById(id);
  }

  @Get('consult:id/stats')
  @HttpCode(HttpStatus.OK)
  async findByIdWithStats(@Param('id', ParseIntPipe) id: number) {
    return await this.moduleConsultService.findByIdWithStats(id);
  }


  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un modulo por id' })
  @ApiBody({
    type: UpdateModuleDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar modulo',
        value: {
          name: 'nuevo',
          descripction: 'nuevo',
          icon: 'nuevo',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Modulo actualizado exitosamente', type: ModuleResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Moduylo no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(
    @Param('id') id: number,
    @Body() UpdateModuleDto: UpdateModuleDto
  ) {
    return await this.ModuleUpdateService.update(id, UpdateModuleDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un modulo por id' })
  @ApiResponse({ status: 200, description: 'Modulo eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Modulo no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.ModuleDeleteService.delete(id);
  }
}