import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Catch() // Catch all exceptions
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message || 'Internal Server Error';
      const apiResponse = new ApiResponseDto(
        message,
        null,
        exception.message,
        false,
      );
      return response.status(status).json(apiResponse);
    } else {
      console.error(exception);
      const errorMessage = 'An unexpected error occurred';
      const apiResponse = new ApiResponseDto(
        errorMessage,
        null,
        errorMessage,
        false,
      );
      return response.status(500).json(apiResponse);
    }
  }
}
