import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ReportsExportSectionProps {
  timesheetData?: any;
  invoiceData?: any;
  billableHoursData?: any;
}

export function ReportsExportSection({
  timesheetData,
  invoiceData,
  billableHoursData,
}: ReportsExportSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const exportTimesheetPDF = trpc.export.exportTimesheetPDF.useMutation();
  const exportTimesheetCSV = trpc.export.exportTimesheetCSV.useMutation();
  const exportInvoicePDF = trpc.export.exportInvoicePDF.useMutation();
  const exportInvoiceCSV = trpc.export.exportInvoiceCSV.useMutation();
  const exportBillableHoursCSV = trpc.export.exportBillableHoursCSV.useMutation();

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadBinaryFile = (base64Content: string, filename: string, mimeType: string) => {
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportTimesheet = async (exportFormat: "pdf" | "csv") => {
    if (!timesheetData) {
      toast({
        title: "Error",
        description: "No timesheet data available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (exportFormat === "pdf") {
        const result = await exportTimesheetPDF.mutateAsync({
          weekStart: timesheetData.weekStart,
          timesheetData,
        });
        downloadBinaryFile(result.data, result.filename, result.mimeType);
      } else {
        const result = await exportTimesheetCSV.mutateAsync({
          weekStart: timesheetData.weekStart,
          timesheetData,
        });
        downloadFile(result.data, result.filename, result.mimeType);
      }
      toast({
        title: "Success",
        description: `Timesheet exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: `Failed to export timesheet as ${exportFormat.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportInvoice = async (exportFormat: "pdf" | "csv") => {
    if (!invoiceData) {
      toast({
        title: "Error",
        description: "No invoice data available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (exportFormat === "pdf") {
        const result = await exportInvoicePDF.mutateAsync({
          invoiceData,
        });
        downloadBinaryFile(result.data, result.filename, result.mimeType);
      } else {
        const result = await exportInvoiceCSV.mutateAsync({
          invoiceData,
        });
        downloadFile(result.data, result.filename, result.mimeType);
      }
      toast({
        title: "Success",
        description: `Invoice exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: `Failed to export invoice as ${exportFormat.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBillableHours = async () => {
    if (!billableHoursData) {
      toast({
        title: "Error",
        description: "No billable hours data available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await exportBillableHoursCSV.mutateAsync(billableHoursData);
      downloadFile(result.data, result.filename, result.mimeType);
      toast({
        title: "Success",
        description: "Billable hours exported as CSV",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export billable hours",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dusk/20 bg-gradient-to-br from-dusk/5 to-tealime/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dusk">
          <Download className="w-5 h-5" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Download your timesheets, invoices, and billable hours in PDF or CSV format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timesheet Export */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dusk/10 bg-white/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-dusk" />
              <div>
                <p className="font-medium text-sm">Timesheet</p>
                <p className="text-xs text-slate-500">
                  {timesheetData?.weekStart
                    ? `Week of ${format(new Date(timesheetData.weekStart), "MMM d, yyyy")}`
                    : "Current week"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportTimesheet("pdf")}
                disabled={isLoading || !timesheetData}
                size="sm"
                variant="outline"
                className="gap-2 text-dusk hover:text-dusk hover:bg-dusk/5"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportTimesheet("csv")}
                disabled={isLoading || !timesheetData}
                size="sm"
                variant="outline"
                className="gap-2 text-dusk hover:text-dusk hover:bg-dusk/5"
              >
                <Sheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>

          {/* Invoice Export */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dusk/10 bg-white/50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-tealime" />
              <div>
                <p className="font-medium text-sm">Invoice</p>
                <p className="text-xs text-slate-500">
                  {invoiceData?.invoiceNumber ? `Invoice #${invoiceData.invoiceNumber}` : "Latest invoice"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportInvoice("pdf")}
                disabled={isLoading || !invoiceData}
                size="sm"
                variant="outline"
                className="gap-2 text-tealime hover:text-tealime hover:bg-tealime/5"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportInvoice("csv")}
                disabled={isLoading || !invoiceData}
                size="sm"
                variant="outline"
                className="gap-2 text-tealime hover:text-tealime hover:bg-tealime/5"
              >
                <Sheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>

          {/* Billable Hours Export */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dusk/10 bg-white/50">
            <div className="flex items-center gap-3">
              <Sheet className="w-5 h-5 text-charge" />
              <div>
                <p className="font-medium text-sm">Billable Hours Summary</p>
                <p className="text-xs text-slate-500">
                  {billableHoursData?.period ? `Period: ${billableHoursData.period}` : "Current period"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportBillableHours}
              disabled={isLoading || !billableHoursData}
              size="sm"
              variant="outline"
              className="gap-2 text-charge hover:text-charge hover:bg-charge/5"
            >
              <Sheet className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
