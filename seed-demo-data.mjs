import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { contracts, cases, clients, documents, users, firms } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedDemoData() {
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
    console.log('🌱 Seeding demo data...\n');

    // Get test firm
    const testFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.name, 'Test Law Firm'))
      .limit(1);

    if (testFirm.length === 0) {
      console.error('❌ Test Law Firm not found. Run seed-test-accounts.mjs first.');
      process.exit(1);
    }

    const firmId = testFirm[0].id;
    console.log(`✅ Using Test Law Firm (ID: ${firmId})\n`);

    // Get test users
    const testUsers = await db
      .select()
      .from(users)
      .where(eq(users.firmId, firmId));

    const lawyerId = testUsers.find(u => u.role === 'lawyer')?.id;
    const paralegalId = testUsers.find(u => u.role === 'paralegal')?.id;

    if (!lawyerId || !paralegalId) {
      console.error('❌ Test users not found. Run seed-test-accounts.mjs first.');
      process.exit(1);
    }

    // Create demo clients
    console.log('📝 Creating demo clients...');
    const demoClients = [
      {
        name: 'Acme Corporation',
        type: 'corporate',
        email: 'legal@acmecorp.com',
        phone: '+1 (555) 201-1234',
        address: '100 Business Ave, Corporate City, CC 54321',
        firmId,
      },
      {
        name: 'John Smith',
        type: 'individual',
        email: 'john.smith@email.com',
        phone: '+1 (555) 202-5678',
        address: '456 Main St, Anytown, AT 12345',
        firmId,
      },
      {
        name: 'Tech Innovations Inc',
        type: 'corporate',
        email: 'contracts@techinnovations.com',
        phone: '+1 (555) 203-9012',
        address: '789 Innovation Drive, Tech City, TC 67890',
        firmId,
      },
    ];

    const clientIds = [];
    for (const client of demoClients) {
      const existing = await db
        .select()
        .from(clients)
        .where(eq(clients.email, client.email))
        .limit(1);

      if (existing.length === 0) {
        const result = await db.insert(clients).values({
          ...client,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        clientIds.push(result[0].insertId);
        console.log(`  ✅ Created client: ${client.name}`);
      } else {
        clientIds.push(existing[0].id);
        console.log(`  ⏭️  Client already exists: ${client.name}`);
      }
    }

    // Create demo contracts
    console.log('\n📝 Creating demo contracts...');
    const demoContracts = [
      {
        title: 'Service Agreement - Acme Corporation',
        description: 'Annual service agreement for IT consulting services',
        status: 'executed',
        clientId: clientIds[0],
        lawyerId,
        riskLevel: 'low',
        value: 150000,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-01-14'),
        firmId,
      },
      {
        title: 'Employment Contract - John Smith',
        description: 'Executive employment agreement with non-compete clause',
        status: 'executed',
        clientId: clientIds[1],
        lawyerId,
        riskLevel: 'medium',
        value: 250000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2027-02-28'),
        firmId,
      },
      {
        title: 'Software License Agreement - Tech Innovations',
        description: 'Multi-year software licensing and support agreement',
        status: 'draft',
        clientId: clientIds[2],
        lawyerId: paralegalId,
        riskLevel: 'high',
        value: 500000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2026-05-31'),
        firmId,
      },
      {
        title: 'NDA - Acme Corporation',
        description: 'Mutual non-disclosure agreement for partnership discussions',
        status: 'executed',
        clientId: clientIds[0],
        lawyerId: paralegalId,
        riskLevel: 'low',
        value: 0,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-02-01'),
        firmId,
      },
    ];

    const contractIds = [];
    for (const contract of demoContracts) {
      const existing = await db
        .select()
        .from(contracts)
        .where(eq(contracts.name, contract.title))
        .limit(1);

      if (existing.length === 0) {
        const result = await db.insert(contracts).values({
          name: contract.title,
          description: contract.description,
          status: contract.status,
          clientId: contract.clientId,
          uploadedBy: contract.lawyerId,
          riskLevel: contract.riskLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
          firmId: contract.firmId,
        });
        contractIds.push(result[0].insertId);
        console.log(`  ✅ Created contract: ${contract.title}`);
      } else {
        contractIds.push(existing[0].id);
        console.log(`  ⏭️  Contract already exists: ${contract.title}`);
      }
    }

    // Create demo cases
    console.log('\n📝 Creating demo cases...');
    const demoCases = [
      {
        title: 'Acme vs. Competitor - IP Infringement',
        description: 'Intellectual property infringement lawsuit against competitor',
        status: 'active',
        priority: 'high',
        clientId: clientIds[0],
        lawyerId,
        caseType: 'litigation',
        firmId,
      },
      {
        title: 'Smith Employment Dispute',
        description: 'Employment termination dispute resolution',
        status: 'active',
        priority: 'medium',
        clientId: clientIds[1],
        lawyerId: paralegalId,
        caseType: 'dispute_resolution',
        firmId,
      },
      {
        title: 'Tech Innovations - Contract Negotiation',
        description: 'Ongoing contract negotiation for software partnership',
        status: 'active',
        priority: 'high',
        clientId: clientIds[2],
        lawyerId,
        caseType: 'transactional',
        firmId,
      },
      {
        title: 'Regulatory Compliance Review',
        description: 'GDPR and data privacy compliance audit',
        status: 'pending',
        priority: 'medium',
        clientId: clientIds[2],
        lawyerId: paralegalId,
        caseType: 'compliance',
        firmId,
      },
    ];

    const caseIds = [];
    for (const caseData of demoCases) {
      const existing = await db
        .select()
        .from(cases)
        .where(eq(cases.name, caseData.title))
        .limit(1);

      if (existing.length === 0) {
        const result = await db.insert(cases).values({
          name: caseData.title,
          description: caseData.description,
          status: caseData.status,
          priority: caseData.priority,
          clientId: caseData.clientId,
          assignedTo: caseData.lawyerId,
          caseType: caseData.caseType,
          createdAt: new Date(),
          updatedAt: new Date(),
          firmId: caseData.firmId,
        });
        caseIds.push(result[0].insertId);
        console.log(`  ✅ Created case: ${caseData.title}`);
      } else {
        caseIds.push(existing[0].id);
        console.log(`  ⏭️  Case already exists: ${caseData.title}`);
      }
    }

    // Create demo documents
    console.log('\n📝 Creating demo documents...');
    const demoDocuments = [
      {
        title: 'Service Agreement - Final Version',
        type: 'contract',
        description: 'Finalized service agreement ready for execution',
        contractId: contractIds[0],
        caseId: null,
        fileUrl: '/manus-storage/demo-service-agreement.pdf',
        fileKey: 'demo-service-agreement.pdf',
        mimeType: 'application/pdf',
        fileSize: 245000,
        firmId,
      },
      {
        title: 'Employment Contract - Redline Version',
        type: 'contract',
        description: 'Redlined version with client comments',
        contractId: contractIds[1],
        caseId: null,
        fileUrl: '/manus-storage/demo-employment-redline.pdf',
        fileKey: 'demo-employment-redline.pdf',
        mimeType: 'application/pdf',
        fileSize: 189000,
        firmId,
      },
      {
        title: 'IP Infringement Complaint',
        type: 'brief',
        description: 'Legal complaint for IP infringement case',
        contractId: null,
        caseId: caseIds[0],
        fileUrl: '/manus-storage/demo-ip-complaint.pdf',
        fileKey: 'demo-ip-complaint.pdf',
        mimeType: 'application/pdf',
        fileSize: 567000,
        firmId,
      },
      {
        title: 'Settlement Proposal',
        type: 'memo',
        description: 'Settlement proposal for employment dispute',
        contractId: null,
        caseId: caseIds[1],
        fileUrl: '/manus-storage/demo-settlement-proposal.pdf',
        fileKey: 'demo-settlement-proposal.pdf',
        mimeType: 'application/pdf',
        fileSize: 134000,
        firmId,
      },
      {
        title: 'GDPR Compliance Checklist',
        type: 'other',
        description: 'Regulatory compliance checklist and assessment',
        contractId: null,
        caseId: caseIds[3],
        fileUrl: '/manus-storage/demo-gdpr-checklist.pdf',
        fileKey: 'demo-gdpr-checklist.pdf',
        mimeType: 'application/pdf',
        fileSize: 98000,
        firmId,
      },
    ];

    for (const doc of demoDocuments) {
      const existing = await db
        .select()
        .from(documents)
        .where(eq(documents.name, doc.title))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(documents).values({
          name: doc.title,
          description: doc.description,
          type: doc.type,
          contractId: doc.contractId,
          caseId: doc.caseId,
          fileUrl: doc.fileUrl,
          fileKey: doc.fileKey,
          fileMimeType: doc.mimeType,
          fileSize: doc.fileSize,
          firmId: doc.firmId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`  ✅ Created document: ${doc.title}`);
      } else {
        console.log(`  ⏭️  Document already exists: ${doc.title}`);
      }
    }

    console.log('\n✅ Demo data seeding complete!\n');
    console.log('📊 Demo Data Summary:');
    console.log(`  Clients: ${demoClients.length}`);
    console.log(`  Contracts: ${demoContracts.length}`);
    console.log(`  Cases: ${demoCases.length}`);
    console.log(`  Documents: ${demoDocuments.length}`);
    console.log('\n💡 All demo data is associated with "Test Law Firm"');
    console.log('💡 Log in with test accounts to view the demo data');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDemoData().catch(console.error);
