import { Logger } from 'winston';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private configService: ConfigService,
  ) {
    const adapter = new PrismaMariaDb({
      host: configService.get('DB_HOST') || 'localhost',
      port: configService.get('DB_PORT') || 3306,
      user: configService.get('DB_USER') || 'root',
      password: configService.get('DB_PASSWORD') || '',
      database: configService.get('DB_NAME') || 'mydb',
      connectionLimit: 10,
    });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'query' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.registerEventListeners();
  }

  private registerEventListeners() {
    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logger.info({
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn({
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error({
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.debug({
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
        timestamp: e.timestamp,
      });
    });
  }
}
