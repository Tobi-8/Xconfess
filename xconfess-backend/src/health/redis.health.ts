import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const redis = new Redis({ host, port, lazyConnect: true });

    try {
      await redis.connect();
      await redis.ping();
      return this.getStatus(key, true, { host, port });
    } catch {
      throw new HealthCheckError(
        'Redis ping failed',
        this.getStatus(key, false, { host, port }),
      );
    } finally {
      await redis.disconnect();
    }
  }
}