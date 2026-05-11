import { Queue, Worker } from 'bullmq';

// Job queue configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Define job types
export interface TimesheetReminderJob {
  userId: number;
  firmId: number;
  weekOf: Date;
}

export interface InvoiceGenerationJob {
  timesheetId: number;
  firmId: number;
}

export interface ComplianceCheckJob {
  firmId: number;
  checkType: 'gdpr' | 'soc2' | 'hipaa';
}

export interface NotificationDeliveryJob {
  userId: number;
  type: 'email' | 'slack' | 'teams';
  title: string;
  content: string;
}

// Create job queues
export const timesheetReminderQueue = new Queue<TimesheetReminderJob>('timesheet-reminders', { connection: redisConfig });
export const invoiceGenerationQueue = new Queue<InvoiceGenerationJob>('invoice-generation', { connection: redisConfig });
export const complianceCheckQueue = new Queue<ComplianceCheckJob>('compliance-checks', { connection: redisConfig });
export const notificationQueue = new Queue<NotificationDeliveryJob>('notifications', { connection: redisConfig });

// Timesheet reminder worker
export const timesheetReminderWorker = new Worker<TimesheetReminderJob>(
  'timesheet-reminders',
  async (job: any) => {
    console.log(`Processing timesheet reminder for user ${job.data.userId}`);
    // Send reminder notification
    return { success: true, userId: job.data.userId };
  },
  { connection: redisConfig }
);

// Invoice generation worker
export const invoiceGenerationWorker = new Worker<InvoiceGenerationJob>(
  'invoice-generation',
  async (job: any) => {
    console.log(`Generating invoice for timesheet ${job.data.timesheetId}`);
    // Generate invoice from timesheet
    return { success: true, timesheetId: job.data.timesheetId };
  },
  { connection: redisConfig }
);

// Compliance check worker
export const complianceCheckWorker = new Worker<ComplianceCheckJob>(
  'compliance-checks',
  async (job: any) => {
    console.log(`Running ${job.data.checkType} compliance check for firm ${job.data.firmId}`);
    // Run compliance checks
    return { success: true, checkType: job.data.checkType };
  },
  { connection: redisConfig }
);

// Notification delivery worker
export const notificationWorker = new Worker<NotificationDeliveryJob>(
  'notifications',
  async (job: any) => {
    console.log(`Delivering ${job.data.type} notification to user ${job.data.userId}`);
    // Send notification via appropriate channel
    return { success: true, userId: job.data.userId };
  },
  { connection: redisConfig }
);

// Error handlers
timesheetReminderWorker.on('failed', (job: any, err: any) => {
  console.error(`Timesheet reminder job ${job?.id} failed:`, err);
});

invoiceGenerationWorker.on('failed', (job: any, err: any) => {
  console.error(`Invoice generation job ${job?.id} failed:`, err);
});

complianceCheckWorker.on('failed', (job: any, err: any) => {
  console.error(`Compliance check job ${job?.id} failed:`, err);
});

notificationWorker.on('failed', (job: any, err: any) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

// Schedule recurring jobs
export async function scheduleRecurringJobs() {
  // Schedule daily timesheet reminders (9 AM)
  await timesheetReminderQueue.add(
    'daily-reminder',
    { userId: 0, firmId: 0, weekOf: new Date() },
    {
      repeat: {
        pattern: '0 9 * * 1', // Every Monday at 9 AM
      },
    }
  );

  // Schedule weekly compliance checks (Friday 5 PM)
  await complianceCheckQueue.add(
    'weekly-compliance',
    { firmId: 0, checkType: 'soc2' },
    {
      repeat: {
        pattern: '0 17 * * 5', // Every Friday at 5 PM
      },
    }
  );

  console.log('Recurring jobs scheduled');
}

// Add job functions
export async function addTimesheetReminder(data: TimesheetReminderJob) {
  return timesheetReminderQueue.add('reminder', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

export async function addInvoiceGeneration(data: InvoiceGenerationJob) {
  return invoiceGenerationQueue.add('generate', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

export async function addComplianceCheck(data: ComplianceCheckJob) {
  return complianceCheckQueue.add('check', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

export async function addNotification(data: NotificationDeliveryJob) {
  return notificationQueue.add('deliver', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}

// Get queue statistics
export async function getQueueStats() {
  return {
    timesheetReminders: {
      waiting: await timesheetReminderQueue.getWaitingCount(),
      active: await timesheetReminderQueue.getActiveCount(),
      completed: await timesheetReminderQueue.getCompletedCount(),
      failed: await timesheetReminderQueue.getFailedCount(),
    },
    invoiceGeneration: {
      waiting: await invoiceGenerationQueue.getWaitingCount(),
      active: await invoiceGenerationQueue.getActiveCount(),
      completed: await invoiceGenerationQueue.getCompletedCount(),
      failed: await invoiceGenerationQueue.getFailedCount(),
    },
    complianceChecks: {
      waiting: await complianceCheckQueue.getWaitingCount(),
      active: await complianceCheckQueue.getActiveCount(),
      completed: await complianceCheckQueue.getCompletedCount(),
      failed: await complianceCheckQueue.getFailedCount(),
    },
    notifications: {
      waiting: await notificationQueue.getWaitingCount(),
      active: await notificationQueue.getActiveCount(),
      completed: await notificationQueue.getCompletedCount(),
      failed: await notificationQueue.getFailedCount(),
    },
  };
}
