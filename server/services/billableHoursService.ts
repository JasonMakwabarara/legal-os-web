import * as db from "../db";

/**
 * Billable Hours Calculation Service
 * Handles all calculations for time tracking, billing, and revenue projections
 */

interface TimeEntry {
  id: number;
  durationMinutes: number;
  billableMinutes: number;
  hourlyRate: number | any;
  billableAmount: number | any;
  isBillable: "yes" | "no";
  taskType: string;
}

interface BillableRateConfig {
  baseRate: number;
  practiceAreaMultipliers?: Record<string, number>;
  roleMultipliers?: Record<string, number>;
  minimumBillableHours?: number;
  roundingStrategy?: "round" | "ceil" | "floor";
}

/**
 * Calculate billable amount for a time entry
 */
export function calculateBillableAmount(
  billableMinutes: number,
  hourlyRate: number,
  roundingStrategy: "round" | "ceil" | "floor" = "round"
): number {
  const billableHours = billableMinutes / 60;
  const amount = billableHours * hourlyRate;

  // Apply rounding strategy
  switch (roundingStrategy) {
    case "ceil":
      return Math.ceil(amount * 100) / 100;
    case "floor":
      return Math.floor(amount * 100) / 100;
    case "round":
    default:
      return Math.round(amount * 100) / 100;
  }
}

/**
 * Calculate billable minutes with minimum increment rounding
 * (e.g., round to nearest 15 minutes)
 */
export function calculateBillableMinutesWithIncrement(
  durationMinutes: number,
  minimumIncrement: number = 15
): number {
  if (minimumIncrement <= 0) return durationMinutes;
  return Math.ceil(durationMinutes / minimumIncrement) * minimumIncrement;
}

/**
 * Calculate timesheet summary for a period
 */
export function calculateTimesheetSummary(entries: TimeEntry[]) {
  const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  const billableMinutes = entries.reduce((sum, e) => sum + (e.billableMinutes || 0), 0);
  const nonBillableMinutes = totalMinutes - billableMinutes;
  const totalAmount = entries.reduce((sum, e) => sum + parseFloat(e.billableAmount.toString()), 0);

  return {
    totalHours: totalMinutes / 60,
    totalMinutes,
    billableHours: billableMinutes / 60,
    billableMinutes,
    nonBillableHours: nonBillableMinutes / 60,
    nonBillableMinutes,
    billabilityPercentage: totalMinutes > 0 ? (billableMinutes / totalMinutes) * 100 : 0,
    totalAmount: Math.round(totalAmount * 100) / 100,
    entryCount: entries.length,
    averageHourlyRate:
      billableMinutes > 0
        ? Math.round((totalAmount / (billableMinutes / 60)) * 100) / 100
        : 0,
  };
}

/**
 * Calculate task type breakdown
 */
export function calculateTaskTypeBreakdown(entries: TimeEntry[]) {
  const breakdown: Record<
    string,
    {
      hours: number;
      minutes: number;
      billableHours: number;
      billableMinutes: number;
      amount: number;
      count: number;
      percentage: number;
    }
  > = {};

  const totalBillableMinutes = entries.reduce((sum, e) => sum + (e.billableMinutes || 0), 0);

  entries.forEach((entry) => {
    if (!breakdown[entry.taskType]) {
      breakdown[entry.taskType] = {
        hours: 0,
        minutes: 0,
        billableHours: 0,
        billableMinutes: 0,
        amount: 0,
        count: 0,
        percentage: 0,
      };
    }

    breakdown[entry.taskType].hours += (entry.durationMinutes || 0) / 60;
    breakdown[entry.taskType].minutes += entry.durationMinutes || 0;
    breakdown[entry.taskType].billableHours += (entry.billableMinutes || 0) / 60;
    breakdown[entry.taskType].billableMinutes += entry.billableMinutes || 0;
    breakdown[entry.taskType].amount += parseFloat(entry.billableAmount.toString());
    breakdown[entry.taskType].count += 1;
  });

  // Calculate percentages
  Object.keys(breakdown).forEach((taskType) => {
    breakdown[taskType].percentage =
      totalBillableMinutes > 0
        ? (breakdown[taskType].billableMinutes / totalBillableMinutes) * 100
        : 0;
  });

  return breakdown;
}

/**
 * Calculate write-off impact
 */
export function calculateWriteOffImpact(
  originalAmount: number,
  writeOffPercentage: number
): {
  originalAmount: number;
  writeOffAmount: number;
  finalAmount: number;
  writeOffPercentage: number;
} {
  const writeOffAmount = (originalAmount * writeOffPercentage) / 100;
  const finalAmount = originalAmount - writeOffAmount;

  return {
    originalAmount: Math.round(originalAmount * 100) / 100,
    writeOffAmount: Math.round(writeOffAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    writeOffPercentage,
  };
}

/**
 * Calculate revenue projections
 */
export function calculateRevenueProjections(
  billableHours: number,
  hourlyRate: number,
  billabilityPercentage: number
) {
  const adjustedBillableHours = billableHours * (billabilityPercentage / 100);

  return {
    daily: Math.round(adjustedBillableHours * hourlyRate * 100) / 100,
    weekly: Math.round(adjustedBillableHours * 5 * hourlyRate * 100) / 100,
    biweekly: Math.round(adjustedBillableHours * 10 * hourlyRate * 100) / 100,
    monthly: Math.round(adjustedBillableHours * 20 * hourlyRate * 100) / 100,
    quarterly: Math.round(adjustedBillableHours * 60 * hourlyRate * 100) / 100,
    annual: Math.round(adjustedBillableHours * 260 * hourlyRate * 100) / 100,
  };
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(lineItems: any[]) {
  const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  const taxRate = 0.1; // 10% tax (configurable)
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    lineItemCount: lineItems.length,
    totalHours: lineItems.reduce((sum, item) => sum + parseFloat(item.hours.toString()), 0),
  };
}

/**
 * Calculate billability metrics for firm
 */
export async function calculateFirmBillabilityMetrics(
  firmId: number,
  startDate: Date,
  endDate: Date
) {
  // This would query the database for all time entries in the firm
  // and calculate aggregate billability metrics
  return {
    firmId,
    period: { startDate, endDate },
    totalBillableHours: 0,
    totalNonBillableHours: 0,
    billabilityPercentage: 0,
    totalRevenue: 0,
    averageHourlyRate: 0,
    userCount: 0,
    topBillers: [],
  };
}

/**
 * Calculate rate recommendations based on market data
 */
export function calculateRateRecommendations(
  role: string,
  practiceArea: string,
  experience: number
): {
  minimumRate: number;
  marketRate: number;
  premiumRate: number;
  recommendedRate: number;
} {
  // Base rates by role
  const roleRates: Record<string, number> = {
    partner: 300,
    counsel: 250,
    senior_associate: 200,
    associate: 150,
    paralegal: 100,
    junior: 75,
  };

  // Practice area multipliers
  const practiceAreaMultipliers: Record<string, number> = {
    corporate: 1.2,
    litigation: 1.15,
    intellectual_property: 1.25,
    real_estate: 1.0,
    employment: 1.05,
    tax: 1.1,
  };

  const baseRate = roleRates[role] || 150;
  const areaMultiplier = practiceAreaMultipliers[practiceArea] || 1.0;
  const experienceBonus = Math.min(experience * 5, 50); // Max 50% bonus for experience

  const marketRate = Math.round(baseRate * areaMultiplier * 100) / 100;
  const minimumRate = Math.round(marketRate * 0.8 * 100) / 100;
  const premiumRate = Math.round(marketRate * 1.3 * 100) / 100;
  const recommendedRate = Math.round(marketRate * (1 + experienceBonus / 100) * 100) / 100;

  return {
    minimumRate,
    marketRate,
    premiumRate,
    recommendedRate,
  };
}

/**
 * Validate billable entry for compliance
 */
export function validateBillableEntry(entry: TimeEntry): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation rules
  if (entry.durationMinutes < 0) {
    errors.push("Duration cannot be negative");
  }

  if (entry.billableMinutes < 0) {
    errors.push("Billable minutes cannot be negative");
  }

  if (entry.billableMinutes > entry.durationMinutes) {
    errors.push("Billable minutes cannot exceed total duration");
  }

  if (entry.hourlyRate <= 0) {
    errors.push("Hourly rate must be positive");
  }

  // Warnings
  if (entry.durationMinutes > 480) {
    // 8 hours
    warnings.push("Time entry exceeds 8 hours");
  }

  if (entry.isBillable === "yes" && entry.billableMinutes === 0) {
    warnings.push("Entry marked as billable but has 0 billable minutes");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
