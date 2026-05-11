import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, Download, Send, CheckCircle, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

interface TimesheetEntry {
  id: number;
  date: string;
  taskType: string;
  description: string;
  hours: number;
  billable: boolean;
  amount: number;
  status: "draft" | "submitted" | "approved" | "billed";
}

export default function TimesheetDashboard() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  const weekStart = startOfWeek(selectedWeek);
  const weekEnd = endOfWeek(selectedWeek);

  const getTimeEntriesQuery = trpc.timeTracking.getTimeEntries.useQuery({
    startDate: weekStart,
    endDate: weekEnd,
  });

  const getTimesheetSummaryQuery = trpc.timeTracking.getTimesheetSummary.useQuery({
    startDate: weekStart,
    endDate: weekEnd,
  });

  const submitTimesheetMutation = trpc.timeTracking.submitTimesheet.useMutation();

  const handlePreviousWeek = () => {
    setSelectedWeek(addDays(selectedWeek, -7));
  };

  const handleNextWeek = () => {
    setSelectedWeek(addDays(selectedWeek, 7));
  };

  const handleSubmitTimesheet = async () => {
    try {
      // In a real app, we'd create a timesheet first
      // For now, this is a placeholder
      alert("Timesheet submitted for approval");
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
    }
  };

  const summary = getTimesheetSummaryQuery.data;
  const timeEntries = getTimeEntriesQuery.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "submitted":
        return "text-yellow-400";
      case "billed":
        return "text-cyan-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "billed":
        return <CheckCircle className="w-4 h-4" />;
      case "submitted":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePreviousWeek}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            ← Previous
          </Button>
          <div className="text-center min-w-48">
            <p className="text-sm text-slate-400">Week of</p>
            <p className="text-lg font-semibold text-white">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </p>
          </div>
          <Button
            onClick={handleNextWeek}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            Next →
          </Button>
        </div>
        <Button
          onClick={handleSubmitTimesheet}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Timesheet
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-cyan-400">{summary.totalHours.toFixed(1)}</p>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Billable Hours</p>
            <p className="text-2xl font-bold text-green-400">
              {summary.billableHours.toFixed(1)}
            </p>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Billability %</p>
            <p className="text-2xl font-bold text-yellow-400">
              {summary.billabilityPercentage.toFixed(0)}%
            </p>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${summary.totalAmount.toFixed(2)}
            </p>
          </Card>
        </div>
      )}

      {/* Time Entries Table */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-slate-300 font-medium">Task Type</th>
                <th className="px-4 py-3 text-left text-slate-300 font-medium">Description</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Hours</th>
                <th className="px-4 py-3 text-center text-slate-300 font-medium">Billable</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Amount</th>
                <th className="px-4 py-3 text-center text-slate-300 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {timeEntries.length > 0 ? (
                timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 text-slate-300">
                      {format(new Date(entry.startTime), "MMM d")}
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize">
                      {entry.taskType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 font-medium">
                      {((entry.durationMinutes || 0) / 60).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.isBillable === "yes" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 font-medium">
                      ${(entry.billableAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`flex items-center justify-center gap-1 ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        <span className="capitalize text-xs">{entry.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No time entries for this week
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          className="border-slate-600 text-slate-300 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export as PDF
        </Button>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          View Analytics
        </Button>
      </div>
    </div>
  );
}
