import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compileEmailTemplate from './common/services/compile-email.service';
import { QueueJobsService } from './modules/common/queue-jobs/queue-jobs.service';
import {
  QUEUE_JOB_STATUS,
  QUEUE_JOB_TYPE,
} from './modules/common/queue-jobs/queue-jobs.constants';

@Injectable()
export class AppService {
  @Inject(ConfigService)
  public config: ConfigService;

  @Inject(QueueJobsService)
  public queueJobService: QueueJobsService;

  public async getHello() {
    const appName: string = this.config.get('APP_NAME');
    console.log('App Name : ' + appName);

    const data = {
      name: 'Hello World',
      email: 'fazeel786@yopmail.com',
      emailVerificationToken: 'Test12',
    };

    const welcomeEmail = await compileEmailTemplate({
      fileName: 'welcome-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: welcomeEmail,
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    return 'Hello World!';
  }
}
