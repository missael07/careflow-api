import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    (global as any).requestContext = req.user;
    next();
  }
}