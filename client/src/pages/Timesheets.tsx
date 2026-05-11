import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimesheetDashboard } from "@/components/TimesheetDashboard";
import { TimeTracker } from "@/components/TimeTracker";
import { BillableHoursCalculator } from "@/components/BillableHoursCalculator";

export function Timesheets() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"current" | "history" | "calculator">("current");
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "submitted" | "approved">("all");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <p className="text-slate-400">Manage your time entries and billable hours</p>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600">Submit Timesheet</Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "current"
              ? "border-b-2 border-teal-500 text-teal-500"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Current Week
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-teal-500 text-teal-500"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "calculator"
              ? "border-b-2 border-teal-500 text-teal-500"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Calculator
        </button>
      </div>

      {/* Current Week Tab */}
      {activeTab === "current" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimeTracker />
            </div>
            <div>
              <Card className="border-slate-700 bg-slate-900 p-4">
                <h3 className="font-semibold mb-4">This Week Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Hours</span>
                    <span className="font-medium">32.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billable Hours</span>
                    <span className="font-medium text-teal-400">28.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billability %</span>
                    <span className="font-medium">86%</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Revenue</span>
                      <span className="font-medium text-green-400">$4,200</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <TimesheetDashboard />
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="date"
              value={selectedWeek.toISOString().split("T")[0]}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className="w-40 bg-slate-800 border-slate-700"
            />
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((week) => (
              <Card key={week} className="border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Week of {new Date(2026, 4, 11 - week * 7).toLocaleDateString()}</h4>
                    <p className="text-sm text-slate-400">32.5 hours • 86% billable • $4,200</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600">
                      View
                    </Button>
                    <span className="px-3 py-1 bg-green-900 text-green-300 rounded text-sm">Approved</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === "calculator" && (
        <div>
          <BillableHoursCalculator />
        </div>
      )}
    </div>
  );
}
