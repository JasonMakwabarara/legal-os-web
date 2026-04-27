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


// ============================================
// Resend Integration for Invitation Emails
// ============================================

import { Resend } from 'resend';

const resend = ENV.resendApiKey ? new Resend(ENV.resendApiKey) : null;

export interface SendInvitationEmailParams {
  recipientEmail: string;
  recipientName: string;
  firmName: string;
  invitationLink: string;
  inviterName: string;
}

/**
 * Send invitation email using Resend
 */
export async function sendInvitationEmail(params: SendInvitationEmailParams) {
  try {
    if (!resend) {
      console.warn('[EmailService] Resend API key not configured, skipping invitation email');
      return { success: false, error: 'Resend not configured' };
    }

    const { recipientEmail, recipientName, firmName, invitationLink, inviterName } = params;

    const result = await resend.emails.send({
      from: 'noreply@legalosdemo.com',
      to: recipientEmail,
      subject: `You've been invited to ${firmName} on Legal OS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${firmName}!</h2>
          <p>Hi ${recipientName},</p>
          <p>${inviterName} has invited you to join ${firmName} on Legal OS, an AI-powered legal practice management platform.</p>
          
          <div style="margin: 30px 0;">
            <a href="${invitationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p><code>${invitationLink}</code></p>
          
          <p>This invitation will expire in 7 days.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            If you didn't expect this invitation, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('[EmailService] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[EmailService] Invitation email error:', error);
    return { success: false, error: String(error) };
  }
}
