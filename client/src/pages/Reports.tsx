import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";

export function Reports() {
  const [reportType, setReportType] = useState("billability");
  const [timeRange, setTimeRange] = useState("month");

  // Sample data for charts
  const billabilityData = [
    { name: "Week 1", billable: 32, nonBillable: 8 },
    { name: "Week 2", billable: 35, nonBillable: 5 },
    { name: "Week 3", billable: 30, nonBillable: 10 },
    { name: "Week 4", billable: 38, nonBillable: 2 },
  ];

  const revenueData = [
    { name: "Week 1", revenue: 4800 },
    { name: "Week 2", revenue: 5200 },
    { name: "Week 3", revenue: 4500 },
    { name: "Week 4", revenue: 5700 },
  ];

  const taskTypeData = [
    { name: "Research", value: 35, fill: "#14b8a6" },
    { name: "Drafting", value: 28, fill: "#0891b2" },
    { name: "Client Meetings", value: 18, fill: "#06b6d4" },
    { name: "Admin", value: 12, fill: "#22d3ee" },
    { name: "Other", value: 7, fill: "#67e8f9" },
  ];

  const teamPerformanceData = [
    { name: "Alex Rivera", billability: 92, revenue: 18400 },
    { name: "Priya Hale", billability: 88, revenue: 17600 },
    { name: "Jonah West", billability: 85, revenue: 16200 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-slate-400">Track performance and financial metrics — sample analytics for the Rivera & Hale demo firm</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 opacity-60 cursor-not-allowed" title="Export ships with the hosted API" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="billability">Billability</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="team">Team Performance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-900 p-4">
          <p className="text-slate-400 text-sm mb-2">Total Hours</p>
          <p className="text-2xl font-bold">164.5</p>
          <p className="text-xs text-green-400 mt-2">+5.2% vs last month</p>
        </Card>
        <Card className="border-slate-700 bg-slate-900 p-4">
          <p className="text-slate-400 text-sm mb-2">Billable Hours</p>
          <p className="text-2xl font-bold">141.2</p>
          <p className="text-xs text-green-400 mt-2">86% billability rate</p>
        </Card>
        <Card className="border-slate-700 bg-slate-900 p-4">
          <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
          <p className="text-2xl font-bold">$21,180</p>
          <p className="text-xs text-green-400 mt-2">+8.3% vs last month</p>
        </Card>
        <Card className="border-slate-700 bg-slate-900 p-4">
          <p className="text-slate-400 text-sm mb-2">Avg Hourly Rate</p>
          <p className="text-2xl font-bold">$150</p>
          <p className="text-xs text-slate-400 mt-2">Across all tasks</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billability Chart */}
        <Card className="border-slate-700 bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">Billable vs Non-Billable Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={billabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Legend />
              <Bar dataKey="billable" stackId="a" fill="#14b8a6" />
              <Bar dataKey="nonBillable" stackId="a" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-slate-700 bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Type Breakdown */}
        <Card className="border-slate-700 bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">Time by Task Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {taskTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Team Performance */}
        <Card className="border-slate-700 bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">Team Performance</h3>
          <div className="space-y-4">
            {teamPerformanceData.map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-slate-400">{member.billability}% billability</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-400">${member.revenue.toLocaleString()}</p>
                  <div className="w-24 h-2 bg-slate-700 rounded-full mt-1">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${member.billability}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
