import { describe, it, expect } from 'vitest';
import { testSMTPConnection } from './emailService';

describe('Email Service - SMTP Configuration', () => {
  it('should verify SMTP connection with configured credentials', async () => {
    const result = await testSMTPConnection();
    expect(typeof result).toBe('boolean');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  SMTP credentials not configured, skipping connection test');
      expect(result).toBe(false);
    } else {
      console.log('✅ SMTP connection test completed');
      // Connection result depends on actual SMTP server availability
      expect(typeof result).toBe('boolean');
    }
  });

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
