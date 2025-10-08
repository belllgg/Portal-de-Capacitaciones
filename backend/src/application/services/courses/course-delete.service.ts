import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';
import { CourseDeleteDao } from '../../../domain/courses/dao/course-delete.dao';

@Injectable()
export class CourseDeleteService {
  private readonly logger = new Logger(CourseDeleteService.name);

  constructor(
    private readonly courseConsultDao: CourseConsultDao,
    private readonly CourseDeleteDao: CourseDeleteDao,
  ) {}

  /**
   * Eliminar un curso (soft delete - cambiar a ARCHIVED)
   */
  async softDelete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Verificar que el curso existe
      const exists = await this.courseConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Archivar el curso
      await this.CourseDeleteDao.softDelete(id);

      return {
        success: true,
        message: 'Curso archivado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al archivar curso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar un curso permanentemente (solo ADMIN)
   */
  async delete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Verificar que el curso existe
      const exists = await this.courseConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Eliminar el curso
      const deleted = await this.CourseDeleteDao.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el curso'
        };
      }

      return {
        success: true,
        message: 'Curso eliminado permanentemente'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar curso: ${error.message}`, error.stack);
      throw error;
    }
  }

}