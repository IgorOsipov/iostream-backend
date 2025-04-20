import {
  BadRequestException,
  Injectable,
  type NestMiddleware
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as getRawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    if (!req.readable) {
      return next(new BadRequestException('Request is not valid'));
    }
    getRawBody(req, { encoding: 'utf-8' })
      .then(rawBody => {
        req.body = rawBody;
        next();
      })
      .catch(error => {
        throw new BadRequestException(
          'Error while reading request body: ',
          error as Error
        );
        // next(error);
      });
  }
}
