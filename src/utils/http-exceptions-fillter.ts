import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.getStatusCode(exception);
    const message = this.getErrorMessage(exception);
    console.log(exception);

    if (!response || !response.status || !response.json) {
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  getErrorMessage<T>(exception: T): any {
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      const errorMessage =
        (errorResponse as HttpExceptionResponse).message || exception.message;
      return errorMessage;
    } else {
      return String(exception);
    }
  }

  getStatusCode<T>(exception: T): any {
    if (exception instanceof HttpException) {
      const errorStatus = exception.getStatus();
      return errorStatus;
    } else {
      return 500;
    }
  }
}
