import { describe, it, expect } from "vitest";
import * as billableService from "./services/billableHoursService";

describe("Time Tracking System", () => {
  describe("Billable Hours Calculations", () => {
    it("should calculate billable amount correctly", () => {
      const amount = billableService.calculateBillableAmount(120, 150);
      expect(amount).toBe(300); // 2 hours * $150
    });

    it("should apply ceiling rounding strategy", () => {
      const amount = billableService.calculateBillableAmount(125, 150, "ceil");
      expect(amount).toBe(312.5); // 2.083 hours * $150, rounded up
    });

    it("should apply floor rounding strategy", () => {
      const amount = billableService.calculateBillableAmount(125, 150, "floor");
      expect(amount).toBe(312.5); // 2.083 hours * $150, rounded down
    });

    it("should calculate billable minutes with increment rounding", () => {
      const minutes = billableService.calculateBillableMinutesWithIncrement(37, 15);
      expect(minutes).toBe(45); // Rounds up to nearest 15
    });

    it("should handle zero increment gracefully", () => {
      const minutes = billableService.calculateBillableMinutesWithIncrement(37, 0);
      expect(minutes).toBe(37); // Returns original value
    });
  });

  describe("Timesheet Summary Calculations", () => {
    it("should calculate timesheet summary correctly", () => {
      const entries = [
        {
          id: 1,
          durationMinutes: 480,
          billableMinutes: 420,
          hourlyRate: 150,
          billableAmount: 1050,
          isBillable: "yes" as const,
          taskType: "research",
        },
        {
          id: 2,
          durationMinutes: 120,
          billableMinutes: 0,
          hourlyRate: 150,
          billableAmount: 0,
          isBillable: "no" as const,
          taskType: "admin",
        },
      ];

      const summary = billableService.calculateTimesheetSummary(entries);

      expect(summary.totalHours).toBe(10); // 600 minutes
      expect(summary.billableHours).toBe(7); // 420 minutes
      expect(summary.nonBillableHours).toBe(3); // 180 minutes
      expect(summary.billabilityPercentage).toBe(70); // 420/600 * 100
      expect(summary.totalAmount).toBe(1050);
      expect(summary.entryCount).toBe(2);
    });

    it("should handle empty entries array", () => {
      const summary = billableService.calculateTimesheetSummary([]);

      expect(summary.totalHours).toBe(0);
      expect(summary.billableHours).toBe(0);
      expect(summary.billabilityPercentage).toBe(0);
      expect(summary.totalAmount).toBe(0);
    });
  });

  describe("Task Type Breakdown", () => {
    it("should calculate task type breakdown correctly", () => {
      const entries = [
        {
          id: 1,
          durationMinutes: 120,
          billableMinutes: 120,
          hourlyRate: 150,
          billableAmount: 300,
          isBillable: "yes" as const,
          taskType: "research",
        },
        {
          id: 2,
          durationMinutes: 240,
          billableMinutes: 240,
          hourlyRate: 150,
          billableAmount: 600,
          isBillable: "yes" as const,
          taskType: "drafting",
        },
      ];

      const breakdown = billableService.calculateTaskTypeBreakdown(entries);

      expect(breakdown.research).toBeDefined();
      expect(breakdown.research.billableHours).toBe(2); // 120 minutes
      expect(breakdown.research.amount).toBe(300);
      expect(breakdown.research.percentage).toBeCloseTo(33.33, 1);

      expect(breakdown.drafting).toBeDefined();
      expect(breakdown.drafting.billableHours).toBe(4); // 240 minutes
      expect(breakdown.drafting.amount).toBe(600);
      expect(breakdown.drafting.percentage).toBeCloseTo(66.67, 1);
    });
  });

  describe("Write-Off Calculations", () => {
    it("should calculate write-off impact correctly", () => {
      const impact = billableService.calculateWriteOffImpact(1000, 20);

      expect(impact.originalAmount).toBe(1000);
      expect(impact.writeOffAmount).toBe(200);
      expect(impact.finalAmount).toBe(800);
      expect(impact.writeOffPercentage).toBe(20);
    });

    it("should handle zero write-off percentage", () => {
      const impact = billableService.calculateWriteOffImpact(1000, 0);

      expect(impact.finalAmount).toBe(1000);
      expect(impact.writeOffAmount).toBe(0);
    });

    it("should handle 100% write-off", () => {
      const impact = billableService.calculateWriteOffImpact(1000, 100);

      expect(impact.finalAmount).toBe(0);
      expect(impact.writeOffAmount).toBe(1000);
    });
  });

  describe("Revenue Projections", () => {
    it("should calculate revenue projections correctly", () => {
      const projections = billableService.calculateRevenueProjections(8, 150, 80);

      expect(projections.daily).toBe(960); // 8 * 150 * 0.8
      expect(projections.weekly).toBe(4800); // 8 * 5 * 150 * 0.8
      expect(projections.monthly).toBe(19200); // 8 * 20 * 150 * 0.8
      expect(projections.annual).toBe(249600); // 8 * 260 * 150 * 0.8
    });

    it("should handle 100% billability", () => {
      const projections = billableService.calculateRevenueProjections(8, 150, 100);

      expect(projections.daily).toBe(1200); // 8 * 150 * 1.0
    });

    it("should handle 0% billability", () => {
      const projections = billableService.calculateRevenueProjections(8, 150, 0);

      expect(projections.daily).toBe(0);
      expect(projections.annual).toBe(0);
    });
  });

  describe("Invoice Totals", () => {
    it("should calculate invoice totals correctly", () => {
      const lineItems = [
        { amount: 1000, hours: 6.67 },
        { amount: 500, hours: 3.33 },
      ];

      const totals = billableService.calculateInvoiceTotals(lineItems);

      expect(totals.subtotal).toBe(1500);
      expect(totals.tax).toBe(150); // 10% tax
      expect(totals.total).toBe(1650);
      expect(totals.lineItemCount).toBe(2);
      expect(totals.totalHours).toBe(10);
    });
  });

  describe("Entry Validation", () => {
    it("should validate correct entry", () => {
      const entry = {
        id: 1,
        durationMinutes: 120,
        billableMinutes: 100,
        hourlyRate: 150,
        billableAmount: 250,
        isBillable: "yes" as const,
        taskType: "research",
      };

      const validation = billableService.validateBillableEntry(entry);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect negative duration", () => {
      const entry = {
        id: 1,
        durationMinutes: -120,
        billableMinutes: 100,
        hourlyRate: 150,
        billableAmount: 250,
        isBillable: "yes" as const,
        taskType: "research",
      };

      const validation = billableService.validateBillableEntry(entry);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Duration cannot be negative");
    });

    it("should detect billable minutes exceeding duration", () => {
      const entry = {
        id: 1,
        durationMinutes: 60,
        billableMinutes: 120,
        hourlyRate: 150,
        billableAmount: 300,
        isBillable: "yes" as const,
        taskType: "research",
      };

      const validation = billableService.validateBillableEntry(entry);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Billable minutes cannot exceed total duration"
      );
    });

    it("should warn on long entries", () => {
      const entry = {
        id: 1,
        durationMinutes: 600, // 10 hours
        billableMinutes: 600,
        hourlyRate: 150,
        billableAmount: 1500,
        isBillable: "yes" as const,
        taskType: "research",
      };

      const validation = billableService.validateBillableEntry(entry);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain("Time entry exceeds 8 hours");
    });

    it("should warn on billable entry with zero billable minutes", () => {
      const entry = {
        id: 1,
        durationMinutes: 120,
        billableMinutes: 0,
        hourlyRate: 150,
        billableAmount: 0,
        isBillable: "yes" as const,
        taskType: "research",
      };

      const validation = billableService.validateBillableEntry(entry);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain(
        "Entry marked as billable but has 0 billable minutes"
      );
    });
  });

  describe("Rate Recommendations", () => {
    it("should recommend rates for partner in corporate law", () => {
      const rates = billableService.calculateRateRecommendations(
        "partner",
        "corporate",
        10
      );

      expect(rates.minimumRate).toBeGreaterThan(0);
      expect(rates.marketRate).toBeGreaterThan(rates.minimumRate);
      expect(rates.premiumRate).toBeGreaterThan(rates.marketRate);
      expect(rates.recommendedRate).toBeGreaterThan(rates.marketRate);
    });

    it("should apply practice area multiplier", () => {
      const corporateRates = billableService.calculateRateRecommendations(
        "associate",
        "corporate",
        5
      );
      const realEstateRates = billableService.calculateRateRecommendations(
        "associate",
        "real_estate",
        5
      );

      expect(corporateRates.marketRate).toBeGreaterThan(realEstateRates.marketRate);
    });

    it("should apply experience bonus", () => {
      const junior = billableService.calculateRateRecommendations(
        "associate",
        "corporate",
        1
      );
      const senior = billableService.calculateRateRecommendations(
        "associate",
        "corporate",
        10
      );

      expect(senior.recommendedRate).toBeGreaterThan(junior.recommendedRate);
    });
  });
});
