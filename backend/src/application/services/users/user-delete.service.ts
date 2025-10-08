import { Injectable, Logger } from '@nestjs/common';
import { UserDeleteDao } from '../../../domain/users/dao/user-delete.dao';

@Injectable()
export class UserDeleteService {
  private readonly logger = new Logger(UserDeleteService.name);
 
  constructor(private readonly userDeleteDao: UserDeleteDao) {}

  async deleteByEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const deleted = await this.userDeleteDao.delete(email);

      if (!deleted) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      this.logger.log(`Usuario eliminado exitosamente: ${email}`);
     
      return {
        success: true,
        message: 'Usuario eliminado'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }
}
