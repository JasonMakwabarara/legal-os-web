import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { format } from "date-fns";
// @ts-ignore - json2csv types not available
import json2csv from "json2csv";

const Parser = (json2csv as any).Parser;

export interface TimesheetExportData {
  userId: number;
  weekStart: Date;
  entries: Array<{
    date: Date;
    taskType: string;
    description: string;
    hours: number;
    billable: boolean;
    ratePerHour: number;
  }>;
  totalHours: number;
  billableHours: number;
  billablePercentage: number;
  totalRevenue: number;
}

export interface InvoiceExportData {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  clientName: string;
  clientEmail: string;
  lineItems: Array<{
    description: string;
    hours: number;
    ratePerHour: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

/**
 * Generate PDF for timesheet export
 */
export async function generateTimesheetPDF(data: TimesheetExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  // Header
  page.drawText("TIMESHEET REPORT", {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0.2, 0.4, 0.6), // Dusk color
  });

  // Week information
  let yPosition = height - 100;
  page.drawText(`Week of: ${format(data.weekStart, "MMMM d, yyyy")}`, {
    x: 50,
    y: yPosition,
    size: 12,
  });

  yPosition -= 30;
  page.drawText(`Total Hours: ${data.totalHours}`, {
    x: 50,
    y: yPosition,
    size: 11,
  });

  yPosition -= 20;
  page.drawText(`Billable Hours: ${data.billableHours} (${data.billablePercentage.toFixed(1)}%)`, {
    x: 50,
    y: yPosition,
    size: 11,
  });

  yPosition -= 20;
  page.drawText(`Total Revenue: $${data.totalRevenue.toFixed(2)}`, {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0.0, 0.6, 0.3), // Tealime color
  });

  // Table headers
  yPosition -= 40;
  const columnX = [50, 120, 220, 320, 420, 520];
  const headers = ["Date", "Task Type", "Description", "Hours", "Billable", "Rate"];

  headers.forEach((header, i) => {
    page.drawText(header, {
      x: columnX[i],
      y: yPosition,
      size: 10,
      color: rgb(0.2, 0.4, 0.6),
    });
  });

  // Draw line
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 560, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Table rows
  yPosition -= 25;
  data.entries.forEach((entry) => {
    if (yPosition < 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }

    page.drawText(format(entry.date, "MM/dd"), {
      x: columnX[0],
      y: yPosition,
      size: 9,
    });

    page.drawText(entry.taskType, {
      x: columnX[1],
      y: yPosition,
      size: 9,
    });

    page.drawText(entry.description.substring(0, 20), {
      x: columnX[2],
      y: yPosition,
      size: 9,
    });

    page.drawText(entry.hours.toString(), {
      x: columnX[3],
      y: yPosition,
      size: 9,
    });

    page.drawText(entry.billable ? "Yes" : "No", {
      x: columnX[4],
      y: yPosition,
      size: 9,
    });

    page.drawText(`$${entry.ratePerHour}`, {
      x: columnX[5],
      y: yPosition,
      size: 9,
    });

    yPosition -= 20;
  });

  // Footer
  page.drawText(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, {
    x: 50,
    y: 30,
    size: 8,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate CSV for timesheet export
 */
export function generateTimesheetCSV(data: TimesheetExportData): string {
  const csvData: any[] = data.entries.map((entry) => ({
    Date: format(entry.date, "MM/dd/yyyy"),
    "Task Type": entry.taskType,
    Description: entry.description,
    Hours: entry.hours,
    Billable: entry.billable ? "Yes" : "No",
    "Rate/Hour": `$${entry.ratePerHour}`,
    Amount: `$${(entry.hours * entry.ratePerHour).toFixed(2)}`,
  }));

  // Add summary rows
  csvData.push({
    Date: "",
    "Task Type": "SUMMARY",
    Description: "",
    Hours: data.totalHours,
    Billable: `${data.billablePercentage.toFixed(1)}%`,
    "Rate/Hour": "",
    Amount: `$${data.totalRevenue.toFixed(2)}`,
  });

  try {
    const parser = new Parser();
    return parser.parse(csvData);
  } catch (error) {
    console.error("CSV generation error:", error);
    throw new Error("Failed to generate CSV");
  }
}

/**
 * Generate PDF for invoice export
 */
export async function generateInvoicePDF(data: InvoiceExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  // Header
  page.drawText("INVOICE", {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Invoice details
  let yPosition = height - 100;
  page.drawText(`Invoice #: ${data.invoiceNumber}`, {
    x: 50,
    y: yPosition,
    size: 11,
  });

  yPosition -= 20;
  page.drawText(`Date: ${format(data.invoiceDate, "MMMM d, yyyy")}`, {
    x: 50,
    y: yPosition,
    size: 11,
  });

  yPosition -= 20;
  page.drawText(`Due Date: ${format(data.dueDate, "MMMM d, yyyy")}`, {
    x: 50,
    y: yPosition,
    size: 11,
  });

  // Client information
  yPosition -= 40;
  page.drawText("BILL TO:", {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0.2, 0.4, 0.6),
  });

  yPosition -= 20;
  page.drawText(data.clientName, {
    x: 50,
    y: yPosition,
    size: 10,
  });

  yPosition -= 15;
  page.drawText(data.clientEmail, {
    x: 50,
    y: yPosition,
    size: 10,
  });

  // Line items table
  yPosition -= 40;
  const columnX = [50, 220, 380, 480];
  const headers = ["Description", "Hours", "Rate", "Amount"];

  headers.forEach((header, i) => {
    page.drawText(header, {
      x: columnX[i],
      y: yPosition,
      size: 10,
      color: rgb(0.2, 0.4, 0.6),
    });
  });

  // Draw line
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 560, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Line items
  yPosition -= 25;
  data.lineItems.forEach((item) => {
    page.drawText(item.description.substring(0, 30), {
      x: columnX[0],
      y: yPosition,
      size: 9,
    });

    page.drawText(item.hours.toString(), {
      x: columnX[1],
      y: yPosition,
      size: 9,
    });

    page.drawText(`$${item.ratePerHour}`, {
      x: columnX[2],
      y: yPosition,
      size: 9,
    });

    page.drawText(`$${item.amount.toFixed(2)}`, {
      x: columnX[3],
      y: yPosition,
      size: 9,
    });

    yPosition -= 20;
  });

  // Totals
  yPosition -= 20;
  page.drawLine({
    start: { x: 380, y: yPosition },
    end: { x: 560, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  yPosition -= 20;
  page.drawText("Subtotal:", {
    x: 380,
    y: yPosition,
    size: 10,
  });
  page.drawText(`$${data.subtotal.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 10,
  });

  yPosition -= 20;
  page.drawText("Tax:", {
    x: 380,
    y: yPosition,
    size: 10,
  });
  page.drawText(`$${data.tax.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 10,
  });

  yPosition -= 20;
  page.drawText("TOTAL:", {
    x: 380,
    y: yPosition,
    size: 11,
    color: rgb(0.0, 0.6, 0.3),
  });
  page.drawText(`$${data.total.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 11,
    color: rgb(0.0, 0.6, 0.3),
  });

  // Status
  yPosition -= 40;
  page.drawText(`Status: ${data.status}`, {
    x: 50,
    y: yPosition,
    size: 10,
  });

  // Footer
  page.drawText(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, {
    x: 50,
    y: 30,
    size: 8,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate CSV for invoice export
 */
export function generateInvoiceCSV(data: InvoiceExportData): string {
  const csvData: any[] = data.lineItems.map((item) => ({
    Description: item.description,
    Hours: item.hours,
    "Rate/Hour": `$${item.ratePerHour}`,
    Amount: `$${item.amount.toFixed(2)}`,
  }));

  // Add totals
  csvData.push({
    Description: "",
    Hours: "",
    "Rate/Hour": "Subtotal:",
    Amount: `$${data.subtotal.toFixed(2)}`,
  });

  csvData.push({
    Description: "",
    Hours: "",
    "Rate/Hour": "Tax:",
    Amount: `$${data.tax.toFixed(2)}`,
  });

  csvData.push({
    Description: "",
    Hours: "",
    "Rate/Hour": "TOTAL:",
    Amount: `$${data.total.toFixed(2)}`,
  });

  try {
    const parser = new Parser();
    return parser.parse(csvData);
  } catch (error) {
    console.error("CSV generation error:", error);
    throw new Error("Failed to generate CSV");
  }
}

/**
 * Generate CSV for billable hours summary
 */
export function generateBillableHoursCSV(data: {
  period: string;
  entries: Array<{
    date: string;
    taskType: string;
    hours: number;
    billable: boolean;
    rate: number;
  }>;
  summary: {
    totalHours: number;
    billableHours: number;
    billablePercentage: number;
    totalRevenue: number;
  };
}): string {
  const csvData = [
    {
      Period: data.period,
      "": "",
      "": "",
      "": "",
    },
    {
      Date: "Date",
      "Task Type": "Task Type",
      Hours: "Hours",
      Billable: "Billable",
      "Rate/Hour": "Rate/Hour",
      Amount: "Amount",
    },
    ...data.entries.map((entry) => ({
      Date: entry.date,
      "Task Type": entry.taskType,
      Hours: entry.hours,
      Billable: entry.billable ? "Yes" : "No",
      "Rate/Hour": `$${entry.rate}`,
      Amount: `$${(entry.hours * entry.rate).toFixed(2)}`,
    })),
    {
      Date: "",
      "Task Type": "SUMMARY",
      Hours: data.summary.totalHours,
      Billable: `${data.summary.billablePercentage.toFixed(1)}%`,
      "Rate/Hour": "",
      Amount: `$${data.summary.totalRevenue.toFixed(2)}`,
    },
  ];

  try {
    const parser = new Parser({ header: false });
    return parser.parse(csvData);
  } catch (error) {
    console.error("CSV generation error:", error);
    throw new Error("Failed to generate CSV");
  }
}
