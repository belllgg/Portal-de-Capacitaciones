import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<boolean> {
    try {
      const validUsername = this.configService.get<string>('AUTH_USERNAME');
      const validPassword = this.configService.get<string>('AUTH_PASSWORD');

      if (!validUsername || !validPassword) {
        this.logger.error('Credenciales no configuradas en variables de entorno');
        return false;
      }

      return username === validUsername && password === validPassword;
    } catch (error) {
      this.logger.error(`Error al validar usuario: ${error.message}`);
      return false;
    }
  }

  async login(credentials: { username: string; password: string }) {
    try {
      const isValid = await this.validateUser(credentials.username, credentials.password);
      
      if (!isValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const payload = { username: credentials.username, sub: 1 };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.logger.error(`Error en servicio de autenticación: ${error.message}`);
      throw error; 
    }
  }
}