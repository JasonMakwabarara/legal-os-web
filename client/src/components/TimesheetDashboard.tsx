import { useState } from "react";
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

export function TimesheetDashboard() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  const weekStart = startOfWeek(selectedWeek);
  const weekEnd = endOfWeek(selectedWeek);

  const getTimeEntriesQuery = trpc.timeTracking.getTimeEntries.useQuery({
    startDate: weekStart,
    endDate: weekEnd,
  });

  const submitTimesheetMutation = trpc.timeTracking.submitTimesheet.useMutation();

  // Calculate totals
  const totals = {
    hours: entries.reduce((sum, e) => sum + e.hours, 0),
    billableHours: entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0),
    amount: entries.reduce((sum, e) => sum + e.amount, 0),
  };

  const handleSubmit = async () => {
    try {
      await submitTimesheetMutation.mutateAsync({
        weekStart,
        weekEnd,
        entries,
      });
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
    }
  };

  const handlePreviousWeek = () => {
    setSelectedWeek(addDays(selectedWeek, -7));
  };

  const handleNextWeek = () => {
    setSelectedWeek(addDays(selectedWeek, 7));
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="p-4 bg-slate-900 border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span className="text-white font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePreviousWeek} variant="outline" size="sm">
              Previous
            </Button>
            <Button onClick={handleNextWeek} variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900 border-slate-700">
          <p className="text-sm text-slate-400">Total Hours</p>
          <p className="text-2xl font-bold text-white">{totals.hours.toFixed(1)}h</p>
        </Card>
        <Card className="p-4 bg-teal-900 border-teal-700">
          <p className="text-sm text-teal-300">Billable Hours</p>
          <p className="text-2xl font-bold text-white">{totals.billableHours.toFixed(1)}h</p>
        </Card>
        <Card className="p-4 bg-green-900 border-green-700">
          <p className="text-sm text-green-300">Total Amount</p>
          <p className="text-2xl font-bold text-white">${totals.amount.toFixed(2)}</p>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card className="p-4 bg-slate-900 border-slate-700 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Time Entries</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2 text-slate-400">Date</th>
              <th className="text-left py-2 px-2 text-slate-400">Task Type</th>
              <th className="text-left py-2 px-2 text-slate-400">Description</th>
              <th className="text-right py-2 px-2 text-slate-400">Hours</th>
              <th className="text-center py-2 px-2 text-slate-400">Billable</th>
              <th className="text-right py-2 px-2 text-slate-400">Amount</th>
              <th className="text-center py-2 px-2 text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-slate-400">
                  No time entries for this week
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 px-2 text-white">{format(new Date(entry.date), "MMM d")}</td>
                  <td className="py-2 px-2 text-slate-300">{entry.taskType}</td>
                  <td className="py-2 px-2 text-slate-400">{entry.description}</td>
                  <td className="py-2 px-2 text-right text-white">{entry.hours.toFixed(1)}</td>
                  <td className="py-2 px-2 text-center">
                    {entry.billable ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-white">${entry.amount.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        entry.status === "approved"
                          ? "bg-green-900 text-green-300"
                          : entry.status === "submitted"
                            ? "bg-blue-900 text-blue-300"
                            : entry.status === "billed"
                              ? "bg-purple-900 text-purple-300"
                              : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={entries.length === 0 || submitTimesheetMutation.isPending}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Timesheet
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}

export default TimesheetDashboard;
