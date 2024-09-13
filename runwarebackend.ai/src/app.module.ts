import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonModule } from './modules/common/common.module';
import { AuthModule } from './modules/common/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/custom-filter-exception';
import { CacheModule } from '@nestjs/cache-manager';
import { QueueJobsModule } from './modules/common/queue-jobs/queue-jobs.module';
import { ScheduleModule } from '@nestjs/schedule';

const envFilePath = `${process.cwd()}/.env`;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),

    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.DB),
    AuthModule,
    CommonModule,
    QueueJobsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
