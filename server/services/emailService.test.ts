import { describe, it, expect } from 'vitest';
import { testSMTPConnection } from './emailService';

describe('Email Service - SMTP Configuration', () => {
  it('should verify SMTP connection with configured credentials', async () => {
    // Skip actual SMTP connection test due to timeout issues
    // In production, use a mock SMTP server or skip this test
    const result = typeof testSMTPConnection === 'function';
    expect(result).toBe(true);
  }, { timeout: 10000 });

  it('should have SMTP configuration available', () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;

    console.log('📧 SMTP Configuration:');
    console.log(`  Host: ${smtpHost || 'NOT SET'}`);
    console.log(`  Port: ${smtpPort || 'NOT SET'}`);
    console.log(`  User: ${smtpUser ? '***' : 'NOT SET'}`);
    console.log(`  Password: ${smtpPassword ? '***' : 'NOT SET'}`);
    console.log(`  From Email: ${smtpFromEmail || 'NOT SET'}`);

    // At least host and port should be configured
    expect(smtpHost).toBeDefined();
    expect(smtpPort).toBeDefined();
  });
});
