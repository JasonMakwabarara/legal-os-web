import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    // Contracts / cases / clients
    getContractsByFirm: vi.fn(),
    getCasesByFirm: vi.fn(),
    getClientsByFirm: vi.fn(),
    getContractById: vi.fn(),
    // E-signatures
    createESignature: vi.fn(),
    // Time tracking
    getBillableRateForUser: vi.fn(),
    createTimeEntry: vi.fn(),
    getTimesheetById: vi.fn(),
    createInvoice: vi.fn(),
    getTimeEntriesByDateRange: vi.fn(),
    createInvoiceLineItem: vi.fn(),
    updateTimesheet: vi.fn(),
    // Workflows
    createWorkflow: vi.fn(),
    getWorkflowById: vi.fn(),
    updateWorkflow: vi.fn(),
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const FIRM_ID = 42;
const USER_ID = 1;

function createCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: USER_ID,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    firmId: FIRM_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createCaller(overrides: Partial<AuthenticatedUser> = {}) {
  return appRouter.createCaller(createCtx(overrides));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("contracts router", () => {
  it("lists contracts scoped to the user's firm", async () => {
    const contracts = [
      { id: 1, firmId: FIRM_ID, name: "Master Services Agreement", status: "review" },
      { id: 2, firmId: FIRM_ID, name: "NDA - Acme", status: "draft" },
    ];
    vi.mocked(db.getContractsByFirm).mockResolvedValue(contracts as any);

    const result = await createCaller().contracts.list();

    expect(result).toEqual(contracts);
    expect(db.getContractsByFirm).toHaveBeenCalledTimes(1);
    expect(db.getContractsByFirm).toHaveBeenCalledWith(FIRM_ID);
  });

  it("rejects contract listing for users without a firm", async () => {
    await expect(createCaller({ firmId: null }).contracts.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(db.getContractsByFirm).not.toHaveBeenCalled();
  });
});

describe("cases and clients routers", () => {
  it("lists cases for the user's firm", async () => {
    const cases = [{ id: 3, firmId: FIRM_ID, name: "Smith v. Jones" }];
    vi.mocked(db.getCasesByFirm).mockResolvedValue(cases as any);

    const result = await createCaller().cases.list();

    expect(result).toEqual(cases);
    expect(db.getCasesByFirm).toHaveBeenCalledTimes(1);
    expect(db.getCasesByFirm).toHaveBeenCalledWith(FIRM_ID);
  });

  it("lists clients for the user's firm", async () => {
    const clients = [{ id: 9, firmId: FIRM_ID, name: "Acme Corp", email: "legal@acme.com" }];
    vi.mocked(db.getClientsByFirm).mockResolvedValue(clients as any);

    const result = await createCaller().clients.list();

    expect(result).toEqual(clients);
    expect(db.getClientsByFirm).toHaveBeenCalledTimes(1);
    expect(db.getClientsByFirm).toHaveBeenCalledWith(FIRM_ID);
  });
});

describe("eSignatures.sendDocuSign", () => {
  it("creates a schema-valid pending signature record per signer", async () => {
    vi.mocked(db.getContractById).mockResolvedValue({
      id: 10,
      firmId: FIRM_ID,
      name: "MSA",
    } as any);
    vi.mocked(db.createESignature).mockImplementation(
      async (data: any) => ({ ...data, id: 1 })
    );

    const result = await createCaller().eSignatures.sendDocuSign({
      contractId: 10,
      signers: [
        { email: "alice@example.com", name: "Alice", role: "signer", order: 1 },
        { email: "bob@example.com", name: "Bob", role: "signer", order: 2 },
      ],
      reminderDays: 3,
      expirationDays: 30,
    });

    expect(result.success).toBe(true);
    expect(result.envelopeId).toMatch(/^DSAPI_/);
    expect(result.signingUrl).toContain(result.envelopeId);

    expect(db.getContractById).toHaveBeenCalledWith(10, FIRM_ID);
    expect(db.createESignature).toHaveBeenCalledTimes(2);

    const firstRecord = vi.mocked(db.createESignature).mock.calls[0]![0] as any;
    expect(firstRecord).toMatchObject({
      firmId: FIRM_ID,
      documentId: 10,
      signerId: USER_ID,
      signerName: "Alice",
      signerEmail: "alice@example.com",
      status: "pending",
      ipAddress: "127.0.0.1",
    });
    // The record must satisfy the eSignatures schema's notNull columns.
    expect(firstRecord.signatureHash).toMatch(/^[0-9a-f]{64}$/);
    expect(firstRecord.verificationToken).toBeTruthy();

    const secondRecord = vi.mocked(db.createESignature).mock.calls[1]![0] as any;
    expect(secondRecord.signerEmail).toBe("bob@example.com");
    expect(secondRecord.status).toBe("pending");
  });

  it("fails when the contract does not exist in the user's firm", async () => {
    vi.mocked(db.getContractById).mockResolvedValue(null);

    await expect(
      createCaller().eSignatures.sendDocuSign({
        contractId: 999,
        signers: [{ email: "alice@example.com", name: "Alice", role: "signer", order: 1 }],
        reminderDays: 3,
        expirationDays: 30,
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    expect(db.createESignature).not.toHaveBeenCalled();
  });
});

describe("timeTracking.createTimeEntry", () => {
  const startTime = new Date("2026-08-18T09:00:00Z");
  const endTime = new Date("2026-08-18T10:30:00Z"); // 90 minutes

  it("computes billable amount from the decimal (string) hourly rate", async () => {
    vi.mocked(db.getBillableRateForUser).mockResolvedValue({
      hourlyRate: "150.00",
    } as any);
    vi.mocked(db.createTimeEntry).mockImplementation(
      async (data: any) => ({ ...data, id: 77 })
    );

    const result = await createCaller().timeTracking.createTimeEntry({
      taskType: "research",
      description: "Case law research",
      startTime,
      endTime,
      isBillable: "yes",
    });

    expect(db.getBillableRateForUser).toHaveBeenCalledWith(FIRM_ID, USER_ID);
    const entry = vi.mocked(db.createTimeEntry).mock.calls[0]![0] as any;
    expect(entry).toMatchObject({
      firmId: FIRM_ID,
      userId: USER_ID,
      durationMinutes: 90,
      billableMinutes: 90,
      isBillable: "yes",
      status: "draft",
      // Decimal columns are strings in the drizzle schema.
      hourlyRate: "150.00",
      billableAmount: "225.00", // 1.5h * $150
    });
    expect(result.id).toBe(77);
  });

  it("records zero billable time for non-billable entries", async () => {
    vi.mocked(db.getBillableRateForUser).mockResolvedValue({
      hourlyRate: "150.00",
    } as any);
    vi.mocked(db.createTimeEntry).mockImplementation(
      async (data: any) => ({ ...data, id: 78 })
    );

    await createCaller().timeTracking.createTimeEntry({
      taskType: "administrative",
      description: "Filing",
      startTime,
      endTime,
      isBillable: "no",
    });

    const entry = vi.mocked(db.createTimeEntry).mock.calls[0]![0] as any;
    expect(entry.durationMinutes).toBe(90);
    expect(entry.billableMinutes).toBe(0);
    expect(entry.billableAmount).toBe("0.00");
  });

  it("falls back to a zero rate when no billable rate is configured", async () => {
    vi.mocked(db.getBillableRateForUser).mockResolvedValue(null);
    vi.mocked(db.createTimeEntry).mockImplementation(
      async (data: any) => ({ ...data, id: 79 })
    );

    await createCaller().timeTracking.createTimeEntry({
      taskType: "research",
      description: "Unrated work",
      startTime,
      endTime,
      isBillable: "yes",
    });

    const entry = vi.mocked(db.createTimeEntry).mock.calls[0]![0] as any;
    expect(entry.hourlyRate).toBe("0.00");
    expect(entry.billableAmount).toBe("0.00");
  });
});

describe("timeTracking.generateInvoice", () => {
  it("invoices approved timesheets, skipping zero-amount entries", async () => {
    const periodStartDate = new Date("2026-08-01");
    const periodEndDate = new Date("2026-08-15");

    vi.mocked(db.getTimesheetById).mockResolvedValue({
      id: 5,
      firmId: FIRM_ID,
      userId: 2,
      status: "approved",
      periodStartDate,
      periodEndDate,
      totalAmount: "525.00",
      totalBillableHours: "3.50",
    } as any);
    vi.mocked(db.createInvoice).mockImplementation(
      async (data: any) => ({ ...data, id: 99 })
    );
    vi.mocked(db.getTimeEntriesByDateRange).mockResolvedValue([
      {
        id: 1,
        description: "Research",
        taskType: "research",
        billableMinutes: 120,
        hourlyRate: "150.00",
        billableAmount: "300.00",
      },
      {
        id: 2,
        description: "Internal admin",
        taskType: "administrative",
        billableMinutes: 0,
        hourlyRate: "150.00",
        billableAmount: "0.00",
      },
    ] as any);
    vi.mocked(db.createInvoiceLineItem).mockImplementation(
      async (data: any) => ({ ...data, id: 501 })
    );
    vi.mocked(db.updateTimesheet).mockResolvedValue({ id: 5, status: "billed" } as any);

    const invoice = await createCaller({ role: "admin" }).timeTracking.generateInvoice({
      timesheetId: 5,
      clientId: 9,
    });

    expect(invoice.id).toBe(99);

    const invoiceData = vi.mocked(db.createInvoice).mock.calls[0]![0] as any;
    expect(invoiceData).toMatchObject({
      firmId: FIRM_ID,
      clientId: 9,
      // Decimal columns stay strings end to end.
      totalAmount: "525.00",
      totalHours: "3.50",
      status: "draft",
    });

    // The "0.00" entry must be skipped (string amounts compared numerically).
    expect(db.createInvoiceLineItem).toHaveBeenCalledTimes(1);
    const lineItem = vi.mocked(db.createInvoiceLineItem).mock.calls[0]![0] as any;
    expect(lineItem).toMatchObject({
      invoiceId: 99,
      timeEntryId: 1,
      hours: "2.00",
      hourlyRate: "150.00",
      amount: "300.00",
    });

    expect(db.updateTimesheet).toHaveBeenCalledWith(5, { status: "billed" });
  });

  it("refuses to invoice unapproved timesheets", async () => {
    vi.mocked(db.getTimesheetById).mockResolvedValue({
      id: 6,
      status: "draft",
    } as any);

    await expect(
      createCaller({ role: "admin" }).timeTracking.generateInvoice({
        timesheetId: 6,
        clientId: 9,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(db.createInvoice).not.toHaveBeenCalled();
  });
});

describe("workflows router", () => {
  it("creates a workflow row that matches the schema and returns its insert id", async () => {
    vi.mocked(db.createWorkflow).mockImplementation(
      async (data: any) => ({ ...data, id: 7 })
    );

    const result = await createCaller().workflows.create({
      name: "Contract Review",
      description: "Route new contracts for review",
      triggers: [{ type: "contract_uploaded" }],
      actions: [{ type: "send_notification", config: { channel: "email" } }],
      enabled: true,
    });

    expect(result).toMatchObject({ success: true, workflowId: 7 });

    const row = vi.mocked(db.createWorkflow).mock.calls[0]![0] as any;
    // Only schema-known columns may be written.
    expect(row).toMatchObject({
      firmId: FIRM_ID,
      type: "contract_review",
      status: "pending",
      progress: 0,
    });
    // The builder definition is preserved in the JSON result column.
    expect(row.result.definition).toMatchObject({
      name: "Contract Review",
      enabled: true,
      createdBy: USER_ID,
    });
    expect(row.result.definition.triggers).toEqual([{ type: "contract_uploaded" }]);
    expect(row).not.toHaveProperty("enabled");
    expect(row).not.toHaveProperty("name");
  });

  it("soft deletes by disabling the stored definition", async () => {
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: 7,
      firmId: FIRM_ID,
      result: { definition: { name: "Contract Review", enabled: true } },
    } as any);
    vi.mocked(db.updateWorkflow).mockResolvedValue({} as any);

    const result = await createCaller().workflows.delete({ workflowId: 7 });

    expect(result.success).toBe(true);
    expect(db.updateWorkflow).toHaveBeenCalledWith(7, {
      result: { definition: { name: "Contract Review", enabled: false } },
    });
  });

  it("merges definition updates into the stored result JSON", async () => {
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: 7,
      firmId: FIRM_ID,
      result: { definition: { name: "Old name", enabled: true } },
    } as any);
    vi.mocked(db.updateWorkflow).mockResolvedValue({} as any);

    await createCaller().workflows.update({
      workflowId: 7,
      data: { name: "New name" },
    });

    expect(db.updateWorkflow).toHaveBeenCalledWith(7, {
      result: { definition: { name: "New name", enabled: true } },
    });
  });

  it("hides workflows belonging to other firms", async () => {
    vi.mocked(db.getWorkflowById).mockResolvedValue({
      id: 8,
      firmId: FIRM_ID + 1,
    } as any);

    await expect(
      createCaller().workflows.getById({ workflowId: 8 })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
