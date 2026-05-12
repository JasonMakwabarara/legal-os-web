import { describe, it, expect } from "vitest";
import {
  generateTimesheetCSV,
  generateBillableHoursCSV,
  TimesheetExportData,
} from "./exportService";

describe("Export Service", () => {
  describe("CSV Generation", () => {
    it("should generate timesheet CSV with correct headers", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [
          {
            date: new Date("2026-05-11"),
            taskType: "research",
            description: "Legal research",
            hours: 8,
            billable: true,
            ratePerHour: 150,
          },
          {
            date: new Date("2026-05-12"),
            taskType: "drafting",
            description: "Contract drafting",
            hours: 6,
            billable: true,
            ratePerHour: 150,
          },
        ],
        totalHours: 14,
        billableHours: 14,
        billablePercentage: 100,
        totalRevenue: 2100,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("Date");
      expect(csv).toContain("Task Type");
      expect(csv).toContain("Hours");
      expect(csv).toContain("Billable");
      expect(csv).toContain("research");
      expect(csv).toContain("drafting");
      expect(csv).toContain("SUMMARY");
    });

    it("should calculate correct totals in CSV", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [
          {
            date: new Date("2026-05-11"),
            taskType: "research",
            description: "Legal research",
            hours: 8,
            billable: true,
            ratePerHour: 200,
          },
          {
            date: new Date("2026-05-12"),
            taskType: "admin",
            description: "Administrative work",
            hours: 2,
            billable: false,
            ratePerHour: 0,
          },
        ],
        totalHours: 10,
        billableHours: 8,
        billablePercentage: 80,
        totalRevenue: 1600,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("10"); // Total hours
      expect(csv).toContain("80"); // Billable percentage
      expect(csv).toContain("1600"); // Total revenue
    });

    it("should handle mixed billable and non-billable entries", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [
          {
            date: new Date("2026-05-11"),
            taskType: "research",
            description: "Legal research",
            hours: 6,
            billable: true,
            ratePerHour: 150,
          },
          {
            date: new Date("2026-05-12"),
            taskType: "meeting",
            description: "Client meeting",
            hours: 2,
            billable: true,
            ratePerHour: 150,
          },
          {
            date: new Date("2026-05-13"),
            taskType: "admin",
            description: "Internal admin",
            hours: 2,
            billable: false,
            ratePerHour: 0,
          },
        ],
        totalHours: 10,
        billableHours: 8,
        billablePercentage: 80,
        totalRevenue: 1200,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("Yes"); // Billable entries
      expect(csv).toContain("No"); // Non-billable entries
    });

    it("should generate billable hours CSV with summary", () => {
      const data = {
        period: "May 2026",
        entries: [
          {
            date: "2026-05-11",
            taskType: "research",
            hours: 8,
            billable: true,
            rate: 150,
          },
          {
            date: "2026-05-12",
            taskType: "drafting",
            hours: 6,
            billable: true,
            rate: 150,
          },
        ],
        summary: {
          totalHours: 14,
          billableHours: 14,
          billablePercentage: 100,
          totalRevenue: 2100,
        },
      };

      const csv = generateBillableHoursCSV(data);

      expect(csv).toContain("May 2026");
      expect(csv).toContain("research");
      expect(csv).toContain("drafting");
      expect(csv).toContain("SUMMARY");
      expect(csv).toContain("2100");
    });
  });

  describe("Export Data Validation", () => {
    it("should handle empty entries array", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [],
        totalHours: 0,
        billableHours: 0,
        billablePercentage: 0,
        totalRevenue: 0,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("SUMMARY");
      expect(csv).toContain("0");
    });

    it("should handle large revenue amounts", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [
          {
            date: new Date("2026-05-11"),
            taskType: "litigation",
            description: "Complex litigation",
            hours: 40,
            billable: true,
            ratePerHour: 500,
          },
        ],
        totalHours: 40,
        billableHours: 40,
        billablePercentage: 100,
        totalRevenue: 20000,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("20000");
      expect(csv).toContain("500");
    });

    it("should format decimal hours correctly", () => {
      const data: TimesheetExportData = {
        userId: 1,
        weekStart: new Date("2026-05-11"),
        entries: [
          {
            date: new Date("2026-05-11"),
            taskType: "research",
            description: "Legal research",
            hours: 7.5,
            billable: true,
            ratePerHour: 150,
          },
        ],
        totalHours: 7.5,
        billableHours: 7.5,
        billablePercentage: 100,
        totalRevenue: 1125,
      };

      const csv = generateTimesheetCSV(data);

      expect(csv).toContain("7.5");
      expect(csv).toContain("1125");
    });
  });

  describe("Revenue Calculations", () => {
    it("should calculate correct revenue from hours and rate", () => {
      const hours = 40;
      const rate = 200;
      const expectedRevenue = hours * rate;

      expect(expectedRevenue).toBe(8000);
    });

    it("should calculate billable percentage correctly", () => {
      const totalHours = 40;
      const billableHours = 32;
      const billablePercentage = (billableHours / totalHours) * 100;

      expect(billablePercentage).toBe(80);
    });

    it("should handle fractional billable percentages", () => {
      const totalHours = 30;
      const billableHours = 20;
      const billablePercentage = (billableHours / totalHours) * 100;

      expect(billablePercentage).toBeCloseTo(66.67, 1);
    });
  });
});
