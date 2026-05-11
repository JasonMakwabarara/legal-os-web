/**
 * Slack Integration Service
 * Handles Slack notifications and interactions for time tracking
 */

interface SlackConfig {
  webhookUrl: string;
  channelId?: string;
  botToken?: string;
}

interface TimeEntryNotification {
  userId: number;
  userName: string;
  taskType: string;
  description: string;
  duration: number; // in minutes
  billableAmount: number;
  timestamp: Date;
}

interface TimesheetNotification {
  userId: number;
  userName: string;
  totalHours: number;
  billableHours: number;
  totalAmount: number;
  status: "submitted" | "approved" | "rejected";
  timestamp: Date;
}

/**
 * Send time entry notification to Slack
 */
export async function sendTimeEntryNotification(
  config: SlackConfig,
  notification: TimeEntryNotification
): Promise<boolean> {
  try {
    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⏱️ *Time Entry Logged*\n*User:* ${notification.userName}`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Task Type:*\n${notification.taskType.replace(/_/g, " ")}`,
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n${(notification.duration / 60).toFixed(2)} hours`,
            },
            {
              type: "mrkdwn",
              text: `*Description:*\n${notification.description}`,
            },
            {
              type: "mrkdwn",
              text: `*Billable Amount:*\n$${notification.billableAmount.toFixed(2)}`,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `_${new Date(notification.timestamp).toLocaleString()}_`,
            },
          ],
        },
      ],
    };

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    return false;
  }
}

/**
 * Send timesheet notification to Slack
 */
export async function sendTimesheetNotification(
  config: SlackConfig,
  notification: TimesheetNotification
): Promise<boolean> {
  try {
    const statusColor = {
      submitted: "#FFA500",
      approved: "#00AA00",
      rejected: "#FF0000",
    }[notification.status];

    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📋 *Timesheet ${notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}*\n*User:* ${notification.userName}`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Hours:*\n${notification.totalHours.toFixed(2)}`,
            },
            {
              type: "mrkdwn",
              text: `*Billable Hours:*\n${notification.billableHours.toFixed(2)}`,
            },
            {
              type: "mrkdwn",
              text: `*Billability:*\n${((notification.billableHours / notification.totalHours) * 100).toFixed(0)}%`,
            },
            {
              type: "mrkdwn",
              text: `*Total Amount:*\n$${notification.totalAmount.toFixed(2)}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Status: *${notification.status.toUpperCase()}*`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `_${new Date(notification.timestamp).toLocaleString()}_`,
            },
          ],
        },
      ],
      attachments: [
        {
          color: statusColor,
          fields: [],
        },
      ],
    };

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack timesheet notification:", error);
    return false;
  }
}

/**
 * Send daily billability summary to Slack
 */
export async function sendDailyBillabilitySummary(
  config: SlackConfig,
  summaries: Array<{
    userId: number;
    userName: string;
    dailyHours: number;
    billableHours: number;
    billabilityPercentage: number;
    amount: number;
  }>
): Promise<boolean> {
  try {
    const fields = summaries.map((s) => ({
      type: "mrkdwn",
      text: `*${s.userName}*\n${s.billableHours.toFixed(2)}h / ${s.dailyHours.toFixed(2)}h (${s.billabilityPercentage.toFixed(0)}%) - $${s.amount.toFixed(2)}`,
    }));

    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📊 *Daily Billability Summary*",
          },
        },
        {
          type: "section",
          fields: fields.slice(0, 10), // Slack limit
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `_Generated at ${new Date().toLocaleString()}_`,
            },
          ],
        },
      ],
    };

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack summary:", error);
    return false;
  }
}

/**
 * Parse Slack slash command for time entry
 */
export function parseSlackTimeCommand(text: string): {
  taskType: string;
  duration: number;
  description: string;
} | null {
  // Format: /time research 2h "Working on contract review"
  const match = text.match(/(\w+)\s+(\d+(?:\.\d+)?)\s*h(?:ours?)?\s+"(.+)"/);

  if (!match) return null;

  const taskType = match[1];
  const duration = Math.round(parseFloat(match[2]) * 60); // Convert to minutes
  const description = match[3];

  return { taskType, duration, description };
}
