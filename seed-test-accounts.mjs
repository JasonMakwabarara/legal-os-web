import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { users, firms } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID || '/superadmin';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'superadmin@legalos.local';
const OWNER_NAME = process.env.OWNER_NAME || 'Super Admin';
const LOCAL_ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD || process.env.SUPERADMIN_PASSWORD;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please ensure your .env file contains DATABASE_URL');
  process.exit(1);
}

if (!LOCAL_ADMIN_PASSWORD) {
  console.error('❌ LOCAL_ADMIN_PASSWORD environment variable is not set');
  console.error('Set LOCAL_ADMIN_PASSWORD (or SUPERADMIN_PASSWORD) to a long random value before seeding');
  process.exit(1);
}

async function seedTestAccounts() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    port: url.port || 3306,
    ...(process.env.DATABASE_SSL === 'false'
      ? {}
      : { ssl: { rejectUnauthorized: false } }),
  });

  const db = drizzle(connection);

  try {
    console.log('🌱 Seeding test accounts...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS localAuthCredentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        email VARCHAR(320) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX localAuthCredentials_userId_idx (userId)
      )
    `);

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
        email: OWNER_EMAIL,
        name: OWNER_NAME,
        role: 'admin',
        description: 'Local Super Admin',
        openId: OWNER_OPEN_ID,
        loginMethod: 'local',
        password: LOCAL_ADMIN_PASSWORD,
      },
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
          openId: account.openId || `test-${account.role}-${Date.now()}`,
          loginMethod: account.loginMethod || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Created ${account.role}: ${account.email}`);
      } else {
        if (account.openId) {
          await db.update(users).set({
            openId: account.openId,
            name: account.name,
            role: account.role,
            firmId,
            loginMethod: account.loginMethod || 'local',
            updatedAt: new Date(),
          }).where(eq(users.email, account.email));
          console.log(`✅ Updated ${account.role}: ${account.email}`);
        } else {
          console.log(`⏭️  ${account.role} account already exists: ${account.email}`);
        }
      }

      if (account.password) {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.email, account.email))
          .limit(1);
        const user = userRows[0];

        if (!user) {
          throw new Error(`Unable to create local auth credential for ${account.email}`);
        }

        await connection.execute(
          `INSERT INTO localAuthCredentials (userId, email, passwordHash)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE userId = VALUES(userId), passwordHash = VALUES(passwordHash), updatedAt = CURRENT_TIMESTAMP`,
          [user.id, account.email.toLowerCase(), hashPassword(account.password)]
        );
        console.log(`✅ Local login enabled: ${account.email}`);
      }
    }

    console.log('\n✅ Test accounts seeding complete!\n');
    console.log('📋 Test Accounts Created:');
    console.log('  Lawyer:    lawyer@testfirm.com');
    console.log('  Paralegal: paralegal@testfirm.com');
    console.log('  User:      user@testfirm.com');
    console.log('  Admin:     admin@testfirm.com');
    console.log(`  Superadmin: ${OWNER_EMAIL} (openId: ${OWNER_OPEN_ID})`);
    console.log('\n💡 All accounts are in the "Test Law Firm" (ID: ' + firmId + ')');
    console.log(`💡 Local admin login: ${OWNER_EMAIL}`);

  } catch (error) {
    console.error('❌ Error seeding test accounts:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedTestAccounts().catch(console.error);
