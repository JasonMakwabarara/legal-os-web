import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface BillableEntry {
  id: number;
  date: string;
  taskType: string;
  durationMinutes: number;
  billableMinutes: number;
  hourlyRate: number;
  billableAmount: number;
  isBillable: "yes" | "no";
}

interface CalculatorProps {
  entries?: BillableEntry[];
  onUpdate?: (summary: any) => void;
}

export default function BillableHoursCalculator({ entries = [], onUpdate }: CalculatorProps) {
  const [hourlyRate, setHourlyRate] = useState(150);
  const [filterBillable, setFilterBillable] = useState<"all" | "billable" | "non-billable">("all");

  const getBillableRateQuery = trpc.timeTracking.getBillableRate.useQuery();

  // Calculate summary metrics
  const summary = useMemo(() => {
    const filtered =
      filterBillable === "billable"
        ? entries.filter((e) => e.isBillable === "yes")
        : filterBillable === "non-billable"
          ? entries.filter((e) => e.isBillable === "no")
          : entries;

    const totalMinutes = filtered.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const billableMinutes = filtered.reduce((sum, e) => sum + (e.billableMinutes || 0), 0);
    const totalAmount = filtered.reduce((sum, e) => sum + (e.billableAmount || 0), 0);

    const rate = getBillableRateQuery.data?.hourlyRate || hourlyRate;
    const calculatedAmount = (billableMinutes / 60) * rate;

    return {
      totalHours: totalMinutes / 60,
      billableHours: billableMinutes / 60,
      nonBillableHours: (totalMinutes - billableMinutes) / 60,
      billabilityPercentage: totalMinutes > 0 ? (billableMinutes / totalMinutes) * 100 : 0,
      totalAmount: calculatedAmount,
      entriesCount: filtered.length,
      averageHourlyRate: rate,
    };
  }, [entries, filterBillable, hourlyRate, getBillableRateQuery.data]);

  const taskTypeBreakdown = useMemo(() => {
    const breakdown: Record<string, { hours: number; amount: number }> = {};
    entries.forEach((entry) => {
      if (!breakdown[entry.taskType]) {
        breakdown[entry.taskType] = { hours: 0, amount: 0 };
      }
      breakdown[entry.taskType].hours += (entry.billableMinutes || 0) / 60;
      breakdown[entry.taskType].amount += entry.billableAmount || 0;
    });
    return Object.entries(breakdown).sort((a, b) => b[1].hours - a[1].hours);
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Hourly Rate Setting */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Hourly Rate</p>
            <p className="text-2xl font-bold text-cyan-400">
              ${summary.averageHourlyRate.toFixed(2)}/hr
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              className="w-24 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
              min="0"
              step="10"
            />
            <span className="text-slate-400">/hr</span>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "billable", "non-billable"] as const).map((filter) => (
          <Button
            key={filter}
            onClick={() => setFilterBillable(filter)}
            variant={filterBillable === filter ? "default" : "outline"}
            className={`capitalize ${
              filterBillable === filter
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "border-slate-600 text-slate-300"
            }`}
          >
            {filter === "non-billable" ? "Non-Billable" : filter}
          </Button>
        ))}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-cyan-400">{summary.totalHours.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{summary.entriesCount} entries</p>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Billable Hours</p>
          <p className="text-2xl font-bold text-green-400">{summary.billableHours.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.billabilityPercentage.toFixed(0)}% billable
          </p>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Non-Billable</p>
          <p className="text-2xl font-bold text-yellow-400">
            {summary.nonBillableHours.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {(100 - summary.billabilityPercentage).toFixed(0)}% non-billable
          </p>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">
            ${summary.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            @ ${summary.averageHourlyRate.toFixed(2)}/hr
          </p>
        </Card>
      </div>

      {/* Billability Alert */}
      {summary.billabilityPercentage < 75 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Low Billability Rate</p>
            <p className="text-xs text-yellow-300 mt-1">
              Your billability is at {summary.billabilityPercentage.toFixed(0)}%. Target is 80%+.
              Consider reducing non-billable time or adjusting rates.
            </p>
          </div>
        </Card>
      )}

      {/* Task Type Breakdown */}
      {taskTypeBreakdown.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Billable Hours by Task Type
          </h3>
          <div className="space-y-3">
            {taskTypeBreakdown.map(([taskType, data]) => (
              <div key={taskType}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 capitalize">
                    {taskType.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {data.hours.toFixed(2)} hrs
                  </span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(data.hours / summary.billableHours) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ${data.amount.toFixed(2)} @ {summary.averageHourlyRate.toFixed(2)}/hr
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Revenue Projection */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Revenue Projections
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Weekly (40 hrs)</p>
            <p className="text-lg font-bold text-emerald-400">
              ${(40 * summary.averageHourlyRate * (summary.billabilityPercentage / 100)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Monthly (160 hrs)</p>
            <p className="text-lg font-bold text-emerald-400">
              ${(160 * summary.averageHourlyRate * (summary.billabilityPercentage / 100)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Annual (2080 hrs)</p>
            <p className="text-lg font-bold text-emerald-400">
              ${(2080 * summary.averageHourlyRate * (summary.billabilityPercentage / 100)).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
