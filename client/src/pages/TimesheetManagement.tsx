import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import TimeTracker from "@/components/TimeTracker";
import TimesheetDashboard from "@/components/TimesheetDashboard";
import BillableHoursCalculator from "@/components/BillableHoursCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, BarChart3, FileText, Settings } from "lucide-react";

export default function TimesheetManagement() {
  const [activeTab, setActiveTab] = useState("timer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Time Tracking & Billing</h1>
          <p className="text-slate-400">
            Track billable hours, manage timesheets, and generate invoices
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger
              value="timer"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timer</span>
            </TabsTrigger>
            <TabsTrigger
              value="timesheet"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Timesheet</span>
            </TabsTrigger>
            <TabsTrigger
              value="calculator"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TimeTracker />
              </div>
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Guide</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div>
                      <p className="font-medium text-cyan-400 mb-1">1. Select Task Type</p>
                      <p className="text-slate-400">
                        Choose the type of work you're performing (research, drafting, etc.)
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-cyan-400 mb-1">2. Enter Description</p>
                      <p className="text-slate-400">
                        Briefly describe what you're working on for billing purposes
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-cyan-400 mb-1">3. Start Timer</p>
                      <p className="text-slate-400">
                        Click start and the timer will begin tracking your time
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-cyan-400 mb-1">4. Pause/Resume</p>
                      <p className="text-slate-400">
                        Use pause if you need to take a break without stopping the timer
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-cyan-400 mb-1">5. Stop & Save</p>
                      <p className="text-slate-400">
                        When done, click stop to save the entry to your timesheet
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Timesheet Tab */}
          <TabsContent value="timesheet" className="space-y-6">
            <TimesheetDashboard />
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <BillableHoursCalculator />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Rate Settings */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Hourly Rate</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Hourly Rate
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">$</span>
                      <input
                        type="number"
                        defaultValue="150"
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                        min="0"
                        step="10"
                      />
                      <span className="text-slate-400">/hour</span>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Save Rate
                  </Button>
                </div>
              </Card>

              {/* Billing Preferences */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Billing Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Minimum Billable Increment
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Save Preferences
                  </Button>
                </div>
              </Card>

              {/* Practice Area Settings */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Practice Area</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Primary Practice Area
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white">
                      <option>Corporate Law</option>
                      <option>Litigation</option>
                      <option>Intellectual Property</option>
                      <option>Real Estate</option>
                      <option>Employment Law</option>
                      <option>Tax Law</option>
                    </select>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Update Practice Area
                  </Button>
                </div>
              </Card>

              {/* Integration Settings */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Slack Integration</p>
                      <p className="text-xs text-slate-400">Send time entries to Slack</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Salesforce Sync</p>
                      <p className="text-xs text-slate-400">Sync with Salesforce CRM</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Teams Integration</p>
                      <p className="text-xs text-slate-400">Notify Teams of timesheet updates</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8 bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">📊 Billability Tips</p>
              <p className="text-sm text-slate-400">
                Aim for 80%+ billability. Track all work time, even if some entries are non-billable.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">💾 Timesheet Submission</p>
              <p className="text-sm text-slate-400">
                Submit timesheets weekly for approval. Once approved, they can be converted to invoices.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">📈 Rate Recommendations</p>
              <p className="text-sm text-slate-400">
                Check the calculator tab for market-based rate recommendations for your role.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
