/**
 * Email Notification Service
 * Handles sending email notifications to users
 */

import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

// Initialize email transporter (using environment variables)
const transporter = nodemailer.createTransport({
  host: ENV.smtpHost,
  port: parseInt(ENV.smtpPort || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: ENV.smtpUser,
    pass: ENV.smtpPassword,
  },
});

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  type: 'deadline' | 'case_update' | 'contract_review' | 'collaboration';
}

export async function sendEmailNotification(email: EmailNotification): Promise<boolean> {
  try {
    if (!ENV.smtpUser || !ENV.smtpPassword) {
      console.warn('[EmailService] SMTP credentials not configured, skipping email');
      return false;
    }

    await transporter.sendMail({
      from: ENV.smtpFromEmail || 'noreply@legalosx.com',
      to: email.to,
      subject: email.subject,
      html: email.htmlContent,
    });

    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    return false;
  }
}

/**
 * Test SMTP connection
 */
export async function testSMTPConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[EmailService] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EmailService] SMTP connection failed:', error);
    return false;
  }
}

export function generateDeadlineEmailHtml(
  firmName: string,
  contractTitle: string,
  dueDate: Date
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>⏰ Upcoming Deadline Alert</h2>
        <p>Hello,</p>
        <p>This is a reminder that <strong>${contractTitle}</strong> has an upcoming deadline.</p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
        <p>Please log in to Legal OS to review and take action.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          This is an automated notification from ${firmName}. 
          <a href="#">Manage notification preferences</a>
        </p>
      </body>
    </html>
  `;
}

export function generateCaseUpdateEmailHtml(
  firmName: string,
  caseTitle: string,
  updateDescription: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>📋 Case Update Notification</h2>
        <p>Hello,</p>
        <p>There's a new update for case: <strong>${caseTitle}</strong></p>
        <p><strong>Update:</strong> ${updateDescription}</p>
        <p>Log in to Legal OS to view full details.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          This is an automated notification from ${firmName}.
          <a href="#">Manage notification preferences</a>
        </p>
      </body>
    </html>
  `;
}

export function generateCollaborationEmailHtml(
  firmName: string,
  collaboratorName: string,
  documentTitle: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>👥 Collaboration Invitation</h2>
        <p>Hello,</p>
        <p><strong>${collaboratorName}</strong> has invited you to collaborate on <strong>${documentTitle}</strong></p>
        <p>Log in to Legal OS to start collaborating.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          This is an automated notification from ${firmName}.
          <a href="#">Manage notification preferences</a>
        </p>
      </body>
    </html>
  `;
}
