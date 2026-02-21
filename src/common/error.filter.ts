import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import z, { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ZodError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        errors: z.flattenError(exception),
      });
    }

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    }

    const error = exception as Error;
    return response.status(500).json({
      errors: error.message,
    });
  }
}
