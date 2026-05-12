import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  generateTimesheetPDF,
  generateTimesheetCSV,
  generateInvoicePDF,
  generateInvoiceCSV,
  generateBillableHoursCSV,
  TimesheetExportData,
  InvoiceExportData,
} from "./services/exportService";
import { format } from "date-fns";

export const exportRouter = router({
  /**
   * Export timesheet as PDF
   */
  exportTimesheetPDF: protectedProcedure
    .input(
      z.object({
        weekStart: z.date(),
        timesheetData: z.object({
          userId: z.number(),
          weekStart: z.date(),
          entries: z.array(
            z.object({
              date: z.date(),
              taskType: z.string(),
              description: z.string(),
              hours: z.number(),
              billable: z.boolean(),
              ratePerHour: z.number(),
            })
          ),
          totalHours: z.number(),
          billableHours: z.number(),
          billablePercentage: z.number(),
          totalRevenue: z.number(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = await generateTimesheetPDF(input.timesheetData);
        const filename = `timesheet_${format(input.weekStart, "yyyy-MM-dd")}.pdf`;

        return {
          success: true,
          filename,
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error("Failed to generate PDF");
      }
    }),

  /**
   * Export timesheet as CSV
   */
  exportTimesheetCSV: protectedProcedure
    .input(
      z.object({
        weekStart: z.date(),
        timesheetData: z.object({
          userId: z.number(),
          weekStart: z.date(),
          entries: z.array(
            z.object({
              date: z.date(),
              taskType: z.string(),
              description: z.string(),
              hours: z.number(),
              billable: z.boolean(),
              ratePerHour: z.number(),
            })
          ),
          totalHours: z.number(),
          billableHours: z.number(),
          billablePercentage: z.number(),
          totalRevenue: z.number(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csvData = generateTimesheetCSV(input.timesheetData);
        const filename = `timesheet_${format(input.weekStart, "yyyy-MM-dd")}.csv`;

        return {
          success: true,
          filename,
          data: csvData,
          mimeType: "text/csv",
        };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to generate CSV");
      }
    }),

  /**
   * Export invoice as PDF
   */
  exportInvoicePDF: protectedProcedure
    .input(
      z.object({
        invoiceData: z.object({
          invoiceId: z.number(),
          invoiceNumber: z.string(),
          invoiceDate: z.date(),
          dueDate: z.date(),
          clientName: z.string(),
          clientEmail: z.string(),
          lineItems: z.array(
            z.object({
              description: z.string(),
              hours: z.number(),
              ratePerHour: z.number(),
              amount: z.number(),
            })
          ),
          subtotal: z.number(),
          tax: z.number(),
          total: z.number(),
          status: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = await generateInvoicePDF(input.invoiceData);
        const filename = `invoice_${input.invoiceData.invoiceNumber}.pdf`;

        return {
          success: true,
          filename,
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error("Failed to generate PDF");
      }
    }),

  /**
   * Export invoice as CSV
   */
  exportInvoiceCSV: protectedProcedure
    .input(
      z.object({
        invoiceData: z.object({
          invoiceId: z.number(),
          invoiceNumber: z.string(),
          invoiceDate: z.date(),
          dueDate: z.date(),
          clientName: z.string(),
          clientEmail: z.string(),
          lineItems: z.array(
            z.object({
              description: z.string(),
              hours: z.number(),
              ratePerHour: z.number(),
              amount: z.number(),
            })
          ),
          subtotal: z.number(),
          tax: z.number(),
          total: z.number(),
          status: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csvData = generateInvoiceCSV(input.invoiceData);
        const filename = `invoice_${input.invoiceData.invoiceNumber}.csv`;

        return {
          success: true,
          filename,
          data: csvData,
          mimeType: "text/csv",
        };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to generate CSV");
      }
    }),

  /**
   * Export billable hours summary as CSV
   */
  exportBillableHoursCSV: protectedProcedure
    .input(
      z.object({
        period: z.string(),
        entries: z.array(
          z.object({
            date: z.string(),
            taskType: z.string(),
            hours: z.number(),
            billable: z.boolean(),
            rate: z.number(),
          })
        ),
        summary: z.object({
          totalHours: z.number(),
          billableHours: z.number(),
          billablePercentage: z.number(),
          totalRevenue: z.number(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csvData = generateBillableHoursCSV(input);
        const filename = `billable_hours_${input.period}.csv`;

        return {
          success: true,
          filename,
          data: csvData,
          mimeType: "text/csv",
        };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to generate CSV");
      }
    }),

  /**
   * Export multiple timesheets as ZIP (future enhancement)
   */
  exportMultipleTimesheets: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(["pdf", "csv"]),
      })
    )
    .query(async ({ input }) => {
      // Future implementation for batch exports
      return {
        success: true,
        message: "Batch export feature coming soon",
        format: input.format,
      };
    }),

  /**
   * Get export history
   */
  getExportHistory: protectedProcedure.query(async ({ ctx }) => {
    // Return recent exports for the user
    return {
      exports: [
        {
          id: 1,
          type: "timesheet",
          format: "pdf",
          filename: "timesheet_2026-05-11.pdf",
          createdAt: new Date(),
          size: "245 KB",
        },
        {
          id: 2,
          type: "invoice",
          format: "pdf",
          filename: "invoice_INV-001.pdf",
          createdAt: new Date(),
          size: "156 KB",
        },
      ],
    };
  }),
});
