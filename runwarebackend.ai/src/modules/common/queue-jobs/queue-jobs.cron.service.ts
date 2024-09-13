import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueJobsService } from './queue-jobs.service';
import { QUEUE_JOB_STATUS, QUEUE_JOB_TYPE } from './queue-jobs.constants';
import { EmailService } from '../../../common/services/email.service';

@Injectable()
export class QueueCronService {
  @Inject(QueueJobsService)
  public queueJobService: QueueJobsService;

  @Inject(EmailService)
  public emailService: EmailService;

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleQueuedEmails() {
    const { data: jobs } = await this.queueJobService.findAll({
      type: QUEUE_JOB_TYPE.EMAIL,
      status: {
        $in: [QUEUE_JOB_STATUS.FAILED, QUEUE_JOB_STATUS.PENDING],
      },
      attempts: { lt: 5 },
    });

    for (const job of jobs) {
      try {
        const { data } = job;

        await this.emailService.sendMail(
          data.email,
          data.subject,
          data.template,
        );

        job.status = QUEUE_JOB_STATUS.SUCCESS;
      } catch (error) {
        job.status = QUEUE_JOB_STATUS.FAILED;
        job.attempts++;
      }

      await this.queueJobService.findByIdAndUpdate(job._id, job);
    }
  }
}
