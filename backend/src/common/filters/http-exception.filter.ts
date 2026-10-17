import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.internalError;
    let message = 'Đã có lỗi xảy ra trên hệ thống';
    let details: Array<{ field?: string; message: string }> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || message;
        code = resObj.code || this.defaultCodeForStatus(status);

        if (Array.isArray(resObj.message)) {
          // Lỗi từ class-validator
          code = ERROR_CODES.validationError;
          message = 'Dữ liệu không hợp lệ.';
          details = resObj.message.map((msg: string) => {
            const firstSpace = msg.indexOf(' ');
            if (firstSpace !== -1) {
              const field = msg.substring(0, firstSpace);
              return { field, message: msg };
            }
            return { message: msg };
          });
        } else if (resObj.details) {
          details = resObj.details;
        }
      }
    } else if (exception instanceof Error) {
      // Prisma error hoặc generic error
      const err = exception as any;
      if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = ERROR_CODES.duplicateRevenueEntry;
        message = 'Dữ liệu đã tồn tại hoặc vi phạm ràng buộc duy nhất';
      } else {
        // Generic error — dùng message mặc định, không lộ exception.message
      }
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private defaultCodeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.validationError;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.unauthorized;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.forbidden;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.notFound;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.duplicateRevenueEntry;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ERROR_CODES.businessRuleViolation;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODES.rateLimited;
      default:
        return ERROR_CODES.internalError;
    }
  }
}
