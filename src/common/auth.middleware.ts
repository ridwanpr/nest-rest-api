import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Request, Response, NextFunction } from 'express';
import { User } from 'src/generated/prisma/client';

export interface AuthRequest extends Request {
  user: User;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: AuthRequest, _res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (token) {
      const user = await this.prismaService.user.findFirst({
        where: { token: token },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  }
}
