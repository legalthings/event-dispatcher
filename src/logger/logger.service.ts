import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { WINSTON } from '../constants';
import winston from 'winston';
import winstonRotateFile from 'winston-daily-rotate-file';
import moment from 'moment';
import util from 'util';
import { ConfigService } from '../config/config.service';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor(
    private readonly config: ConfigService,
    @Inject(WINSTON) private readonly _winston: typeof winston,
  ) { }

  private async createLogger(): Promise<winston.Logger> {
    const formats = [
      winston.format.timestamp(),
      winston.format.printf((info) => {
        const msg = [
          `[${moment(info.timestamp).format()}] - ${info.level}: ${info.message}`,
        ];

        for (const key in info) {
          if (['timestamp', 'message', 'level'].indexOf(key) > -1) {
            continue;
          }

          const value = util.isString(info[key]) ? info[key] : JSON.stringify(info[key], null, 2);
          msg.push(`\n${key}:\n${value}\n`);
        }

        return msg.join('\n');
      }),
    ];

    return winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: (this.config.getLoggerConsole()).level,
          format: winston.format.combine(
            ...[winston.format.colorize()],
            ...formats,
          ),
        }),
        new winstonRotateFile({
          level: 'error',
          format: winston.format.combine(...formats),
          filename: 'error-%DATE%.log',
          dirname: 'logs',
        }),
        new winstonRotateFile({
          level: (this.config.getLoggerCombined()).level,
          format: winston.format.combine(...formats),
          filename: 'combined-%DATE%.log',
          dirname: 'logs',
          handleExceptions: true,
        }),
      ],
    });
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }

  private async log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      this.logger = await this.createLogger();
    }

    this.logger[level](message, meta);
  }
}
