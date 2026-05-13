import { useState, useMemo } from "react";
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

export function BillableHoursCalculator({ entries = [], onUpdate }: CalculatorProps) {
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
      potentialRevenue: calculatedAmount,
      writeOffImpact: totalAmount - calculatedAmount,
    };
  }, [entries, filterBillable, hourlyRate, getBillableRateQuery.data]);

  // Notify parent of updates
  useMemo(() => {
    if (onUpdate) {
      onUpdate(summary);
    }
  }, [summary, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Hours Card */}
        <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Hours</p>
              <p className="text-2xl font-bold text-white">{summary.totalHours.toFixed(1)}h</p>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
        </Card>

        {/* Billable Hours Card */}
        <Card className="p-4 bg-gradient-to-br from-teal-900 to-teal-800 border-teal-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-300">Billable Hours</p>
              <p className="text-2xl font-bold text-white">{summary.billableHours.toFixed(1)}h</p>
              <p className="text-xs text-teal-300 mt-1">{summary.billabilityPercentage.toFixed(1)}%</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        {/* Revenue Card */}
        <Card className="p-4 bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Potential Revenue</p>
              <p className="text-2xl font-bold text-white">${summary.potentialRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Write-off Impact Warning */}
      {summary.writeOffImpact > 0 && (
        <Card className="p-4 bg-amber-900/20 border-amber-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Write-off Impact</p>
            <p className="text-sm text-amber-200">${summary.writeOffImpact.toFixed(2)} in non-billable time</p>
          </div>
        </Card>
      )}

      {/* Filter Controls */}
      <div className="flex gap-2">
        <Button
          variant={filterBillable === "all" ? "default" : "outline"}
          onClick={() => setFilterBillable("all")}
          size="sm"
        >
          All Entries
        </Button>
        <Button
          variant={filterBillable === "billable" ? "default" : "outline"}
          onClick={() => setFilterBillable("billable")}
          size="sm"
        >
          Billable Only
        </Button>
        <Button
          variant={filterBillable === "non-billable" ? "default" : "outline"}
          onClick={() => setFilterBillable("non-billable")}
          size="sm"
        >
          Non-Billable
        </Button>
      </div>

      {/* Hourly Rate Input */}
      <Card className="p-4 bg-slate-900 border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate</label>
        <input
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          placeholder="150"
        />
      </Card>

      {/* Summary Table */}
      <Card className="p-4 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Hours:</span>
            <span className="text-white font-medium">{summary.totalHours.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Billable Hours:</span>
            <span className="text-white font-medium">{summary.billableHours.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Non-Billable Hours:</span>
            <span className="text-white font-medium">{summary.nonBillableHours.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-700">
            <span className="text-slate-400">Billability %:</span>
            <span className="text-teal-400 font-medium">{summary.billabilityPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Potential Revenue:</span>
            <span className="text-green-400 font-medium">${summary.potentialRevenue.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BillableHoursCalculator;
