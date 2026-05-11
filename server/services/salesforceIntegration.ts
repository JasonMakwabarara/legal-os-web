/**
 * Salesforce Integration Service
 * Handles syncing time entries and billable hours with Salesforce
 */

interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  accessToken?: string;
}

interface TimeEntryPayload {
  caseId?: string;
  opportunityId?: string;
  accountId?: string;
  description: string;
  durationMinutes: number;
  billableMinutes: number;
  billableAmount: number;
  taskType: string;
  userId: string;
  date: Date;
}

interface BillabilityMetrics {
  userId: string;
  date: Date;
  totalHours: number;
  billableHours: number;
  billabilityPercentage: number;
  totalAmount: number;
}

/**
 * Authenticate with Salesforce
 */
export async function authenticateSalesforce(config: SalesforceConfig): Promise<string> {
  try {
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      username: config.username,
      password: config.password,
    });

    const response = await fetch(`${config.instanceUrl}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Salesforce authentication failed");
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error("Salesforce auth error:", error);
    throw error;
  }
}

/**
 * Create time entry record in Salesforce
 */
export async function createSalesforceTimeEntry(
  config: SalesforceConfig,
  entry: TimeEntryPayload
): Promise<{ id: string; success: boolean }> {
  try {
    const accessToken = config.accessToken || (await authenticateSalesforce(config));

    const payload = {
      Subject: entry.description,
      ActivityDate: entry.date.toISOString().split("T")[0],
      DurationMinutes: entry.durationMinutes,
      Type: "Time Entry",
      Description: `Task: ${entry.taskType}\nBillable: ${entry.billableMinutes} min\nAmount: $${entry.billableAmount.toFixed(2)}`,
      CustomField__c: {
        BillableMinutes: entry.billableMinutes,
        BillableAmount: entry.billableAmount,
        TaskType: entry.taskType,
      },
    };

    // Add case or opportunity relationship
    if (entry.caseId) {
      (payload as any).WhatId = entry.caseId;
    } else if (entry.opportunityId) {
      (payload as any).WhatId = entry.opportunityId;
    } else if (entry.accountId) {
      (payload as any).WhoId = entry.accountId;
    }

    const response = await fetch(
      `${config.instanceUrl}/services/data/v57.0/sobjects/Task`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create Salesforce time entry");
    }

    const data = (await response.json()) as { id: string; success: boolean };
    return data;
  } catch (error) {
    console.error("Salesforce time entry creation error:", error);
    throw error;
  }
}

/**
 * Update Salesforce opportunity with billable metrics
 */
export async function updateOpportunityBillableMetrics(
  config: SalesforceConfig,
  opportunityId: string,
  metrics: BillabilityMetrics
): Promise<boolean> {
  try {
    const accessToken = config.accessToken || (await authenticateSalesforce(config));

    const payload = {
      BillableHours__c: metrics.billableHours,
      TotalProjectHours__c: metrics.totalHours,
      BillabilityPercentage__c: metrics.billabilityPercentage,
      ProjectRevenue__c: metrics.totalAmount,
    };

    const response = await fetch(
      `${config.instanceUrl}/services/data/v57.0/sobjects/Opportunity/${opportunityId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Salesforce opportunity update error:", error);
    return false;
  }
}

/**
 * Query Salesforce for related opportunities/cases
 */
export async function querySalesforceRecords(
  config: SalesforceConfig,
  query: string
): Promise<any[]> {
  try {
    const accessToken = config.accessToken || (await authenticateSalesforce(config));

    const response = await fetch(
      `${config.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Salesforce query failed");
    }

    const data = (await response.json()) as { records: any[] };
    return data.records;
  } catch (error) {
    console.error("Salesforce query error:", error);
    return [];
  }
}

/**
 * Sync time entries to Salesforce in batch
 */
export async function batchSyncTimeEntries(
  config: SalesforceConfig,
  entries: TimeEntryPayload[]
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const entry of entries) {
    try {
      await createSalesforceTimeEntry(config, entry);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to sync entry: ${entry.description}`);
    }
  }

  return results;
}

/**
 * Create Salesforce invoice from billable entries
 */
export async function createSalesforceInvoice(
  config: SalesforceConfig,
  accountId: string,
  invoiceData: {
    invoiceNumber: string;
    totalAmount: number;
    totalHours: number;
    lineItems: Array<{ description: string; hours: number; amount: number }>;
    dueDate: Date;
  }
): Promise<{ id: string; success: boolean }> {
  try {
    const accessToken = config.accessToken || (await authenticateSalesforce(config));

    const payload = {
      BillingStreet: "",
      BillingCity: "",
      BillingState: "",
      BillingPostalCode: "",
      BillingCountry: "",
      Amount: invoiceData.totalAmount,
      Description: `Invoice ${invoiceData.invoiceNumber}\nTotal Hours: ${invoiceData.totalHours}`,
      StageName: "Prospecting",
      CloseDate: invoiceData.dueDate.toISOString().split("T")[0],
      AccountId: accountId,
    };

    const response = await fetch(
      `${config.instanceUrl}/services/data/v57.0/sobjects/Opportunity`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create Salesforce invoice");
    }

    const data = (await response.json()) as { id: string; success: boolean };
    return data;
  } catch (error) {
    console.error("Salesforce invoice creation error:", error);
    throw error;
  }
}

/**
 * Map Legal OS task types to Salesforce activity types
 */
export function mapTaskTypeToSalesforce(taskType: string): string {
  const mapping: Record<string, string> = {
    research: "Research",
    drafting: "Drafting",
    review: "Review",
    client_meeting: "Call",
    court_appearance: "Meeting",
    negotiation: "Meeting",
    filing: "Administrative",
    consultation: "Call",
    administrative: "Administrative",
    other: "Other",
  };

  return mapping[taskType] || "Other";
}
