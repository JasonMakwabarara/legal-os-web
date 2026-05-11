import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, Users, DollarSign, Clock } from "lucide-react";

interface TimeData {
  date: string;
  hours: number;
  billableHours: number;
  amount: number;
}

interface TaskTypeData {
  name: string;
  hours: number;
  percentage: number;
}

interface UserMetrics {
  name: string;
  totalHours: number;
  billableHours: number;
  billability: number;
  revenue: number;
}

export default function TimeTrackingReports() {
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "quarterly">("weekly");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Mock data
  const timeData: TimeData[] = [
    { date: "Mon", hours: 8, billableHours: 6.5, amount: 975 },
    { date: "Tue", hours: 8.5, billableHours: 7.2, amount: 1080 },
    { date: "Wed", hours: 8, billableHours: 6.8, amount: 1020 },
    { date: "Thu", hours: 7.5, billableHours: 6.5, amount: 975 },
    { date: "Fri", hours: 8, billableHours: 7, amount: 1050 },
  ];

  const taskTypeData: TaskTypeData[] = [
    { name: "Research", hours: 12, percentage: 28 },
    { name: "Drafting", hours: 14, percentage: 33 },
    { name: "Review", hours: 10, percentage: 24 },
    { name: "Client Meeting", hours: 6, percentage: 15 },
  ];

  const userMetrics: UserMetrics[] = [
    { name: "John Smith", totalHours: 40, billableHours: 34, billability: 85, revenue: 5100 },
    { name: "Sarah Johnson", totalHours: 38, billableHours: 33, billability: 87, revenue: 4950 },
    { name: "Mike Davis", totalHours: 42, billableHours: 35, billability: 83, revenue: 5250 },
  ];

  const summary = useMemo(() => {
    const totalHours = timeData.reduce((sum, d) => sum + d.hours, 0);
    const totalBillable = timeData.reduce((sum, d) => sum + d.billableHours, 0);
    const totalRevenue = timeData.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalHours,
      totalBillable,
      billability: (totalBillable / totalHours) * 100,
      totalRevenue,
      averageDaily: totalRevenue / timeData.length,
    };
  }, []);

  const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(["weekly", "monthly", "quarterly"] as const).map((type) => (
            <Button
              key={type}
              onClick={() => setReportType(type)}
              variant={reportType === type ? "default" : "outline"}
              className={`capitalize ${
                reportType === type
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "border-slate-600 text-slate-300"
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Hours</p>
              <p className="text-2xl font-bold text-cyan-400">{summary.totalHours.toFixed(1)}</p>
            </div>
            <Clock className="w-5 h-5 text-cyan-400/50" />
          </div>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Billable Hours</p>
              <p className="text-2xl font-bold text-green-400">{summary.totalBillable.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400/50" />
          </div>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Billability %</p>
              <p className="text-2xl font-bold text-yellow-400">
                {summary.billability.toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-yellow-400/50" />
          </div>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${summary.totalRevenue.toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-400/50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Trend */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Hours Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Legend />
              <Bar dataKey="hours" fill="#06B6D4" name="Total Hours" />
              <Bar dataKey="billableHours" fill="#10B981" name="Billable Hours" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trend */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                name="Daily Revenue"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Type Breakdown */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Type Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="hours"
              >
                {taskTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }}
                labelStyle={{ color: "#E2E8F0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Type Details */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Type Details</h3>
          <div className="space-y-3">
            {taskTypeData.map((task, index) => (
              <div key={task.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-300">{task.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{task.hours.toFixed(1)}h</p>
                  <p className="text-xs text-slate-500">{task.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team Metrics */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Team Billability Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300 font-medium">User</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Total Hours</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Billable Hours</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Billability %</th>
                <th className="px-4 py-3 text-right text-slate-300 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {userMetrics.map((user) => (
                <tr key={user.name} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{user.name}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{user.totalHours}h</td>
                  <td className="px-4 py-3 text-right text-slate-300">{user.billableHours}h</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {user.billability}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                    ${user.revenue.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
