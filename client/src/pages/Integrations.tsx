import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: Date;
  config?: Record<string, string>;
}

export function Integrations() {
  const [integrations] = useState<Integration[]>([
    {
      id: "clio",
      name: "Clio",
      description: "Practice management — planned when the hosted API is live",
      icon: "Clio",
      status: "disconnected",
    },
    {
      id: "word",
      name: "Microsoft Word",
      description: "Track-changes add-in — the near-term Spellbook competitor",
      icon: "Word",
      status: "disconnected",
    },
    {
      id: "docusign",
      name: "DocuSign",
      description: "E-signature — not connected in this demo",
      icon: "Sign",
      status: "disconnected",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Risk alerts to channels — coming with the server",
      icon: "Slack",
      status: "disconnected",
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-900 text-green-300";
      case "error":
        return "bg-red-900 text-red-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-slate-400">Not connected in this Netlify demo. They ship with the hosted SpiderNet API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="border-slate-700 bg-slate-900 p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{integration.icon}</div>
              <Badge className={getStatusColor(integration.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(integration.status)}
                  {integration.status === "connected" ? "Connected" : integration.status === "error" ? "Error" : "Disconnected"}
                </div>
              </Badge>
            </div>

            <h3 className="font-semibold mb-1">{integration.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{integration.description}</p>

            {integration.lastSync && (
              <p className="text-xs text-slate-500 mb-3">
                Last synced: {integration.lastSync.toLocaleTimeString()}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-600"
                onClick={() => handleConnect(integration)}
              >
                Coming with hosted server
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="border-slate-700 bg-slate-900 p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Configure {selectedIntegration.name}</h2>

            <div className="space-y-4 mb-6">
              {selectedIntegration.id === "slack" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL</label>
                    <Input
                      type="password"
                      placeholder="https://hooks.slack.com/services/..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Channel</label>
                    <Input placeholder="#general" className="bg-slate-800 border-slate-700" />
                  </div>
                </>
              )}

              {selectedIntegration.id === "salesforce" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID</label>
                    <Input placeholder="Your Salesforce Client ID" className="bg-slate-800 border-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Client Secret</label>
                    <Input type="password" placeholder="Your Salesforce Client Secret" className="bg-slate-800 border-slate-700" />
                  </div>
                </>
              )}

              {selectedIntegration.id === "docusign" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <Input type="password" placeholder="Your DocuSign API Key" className="bg-slate-800 border-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account ID</label>
                    <Input placeholder="Your DocuSign Account ID" className="bg-slate-800 border-slate-700" />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-600"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                Save & Connect
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
