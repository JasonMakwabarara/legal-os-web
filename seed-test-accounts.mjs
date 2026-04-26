import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users, firms } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please ensure your .env file contains DATABASE_URL');
  process.exit(1);
}

async function seedTestAccounts() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const db = drizzle(connection);

  try {
    console.log('🌱 Seeding test accounts...');

    // Create or get test firm
    let testFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.name, 'Test Law Firm'))
      .limit(1);

    let firmId;
    if (testFirm.length === 0) {
      console.log('📝 Creating test firm...');
      const result = await db.insert(firms).values({
        name: 'Test Law Firm',
        email: 'admin@testfirm.com',
        phone: '+1 (555) 123-4567',
        address: '123 Legal Street, Law City, LC 12345',
        website: 'https://testfirm.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      firmId = result[0].insertId;
    } else {
      firmId = testFirm[0].id;
    }

    console.log(`✅ Using firm ID: ${firmId}`);

    // Test user accounts
    const testAccounts = [
      {
        email: 'lawyer@testfirm.com',
        name: 'Sarah Johnson',
        role: 'lawyer',
        description: 'Senior Lawyer',
      },
      {
        email: 'paralegal@testfirm.com',
        name: 'Michael Chen',
        role: 'paralegal',
        description: 'Paralegal',
      },
      {
        email: 'user@testfirm.com',
        name: 'Emma Davis',
        role: 'user',
        description: 'Case Manager',
      },
      {
        email: 'admin@testfirm.com',
        name: 'Admin User',
        role: 'admin',
        description: 'System Administrator',
      },
    ];

    // Create test accounts
    for (const account of testAccounts) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);

      if (existingUser.length === 0) {
        console.log(`📝 Creating ${account.role} account: ${account.email}`);
        await db.insert(users).values({
          email: account.email,
          name: account.name,
          role: account.role,
          firmId: firmId,
          openId: `test-${account.role}-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Created ${account.role}: ${account.email}`);
      } else {
        console.log(`⏭️  ${account.role} account already exists: ${account.email}`);
      }
    }

    console.log('\n✅ Test accounts seeding complete!\n');
    console.log('📋 Test Accounts Created:');
    console.log('  Lawyer:    lawyer@testfirm.com');
    console.log('  Paralegal: paralegal@testfirm.com');
    console.log('  User:      user@testfirm.com');
    console.log('  Admin:     admin@testfirm.com');
    console.log('\n💡 All accounts are in the "Test Law Firm" (ID: ' + firmId + ')');
    console.log('💡 Use these emails to log in via OAuth');

  } catch (error) {
    console.error('❌ Error seeding test accounts:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedTestAccounts().catch(console.error);
