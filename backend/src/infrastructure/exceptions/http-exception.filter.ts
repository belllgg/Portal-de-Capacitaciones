import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar el código de estado
    const status = 
      exception instanceof HttpException 
        ? exception.getStatus() 
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Preparar la respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exception)
    };

    // Registrar el error
    this.logger.error(
      `Error en ${request.method} ${request.url}`, 
      JSON.stringify(errorResponse)
    );

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }

  // Método para obtener el mensaje de error de manera segura
  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return 'Error desconocido';
  }
}