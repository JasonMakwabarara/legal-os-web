import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/ui/use-toast";

interface ExportButtonsProps {
  type: "timesheet" | "invoice" | "billableHours";
  data: any;
  filename?: string;
}

export function ExportButtons({ type, data, filename }: ExportButtonsProps) {
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

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      if (type === "timesheet") {
        const result = await exportTimesheetPDF.mutateAsync({
          weekStart: data.weekStart,
          timesheetData: data,
        });
        downloadBinaryFile(result.data, result.filename, result.mimeType);
        toast({
          title: "Success",
          description: `Timesheet exported as PDF: ${result.filename}`,
        });
      } else if (type === "invoice") {
        const result = await exportInvoicePDF.mutateAsync({
          invoiceData: data,
        });
        downloadBinaryFile(result.data, result.filename, result.mimeType);
        toast({
          title: "Success",
          description: `Invoice exported as PDF: ${result.filename}`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      if (type === "timesheet") {
        const result = await exportTimesheetCSV.mutateAsync({
          weekStart: data.weekStart,
          timesheetData: data,
        });
        downloadFile(result.data, result.filename, result.mimeType);
        toast({
          title: "Success",
          description: `Timesheet exported as CSV: ${result.filename}`,
        });
      } else if (type === "invoice") {
        const result = await exportInvoiceCSV.mutateAsync({
          invoiceData: data,
        });
        downloadFile(result.data, result.filename, result.mimeType);
        toast({
          title: "Success",
          description: `Invoice exported as CSV: ${result.filename}`,
        });
      } else if (type === "billableHours") {
        const result = await exportBillableHoursCSV.mutateAsync(data);
        downloadFile(result.data, result.filename, result.mimeType);
        toast({
          title: "Success",
          description: `Billable hours exported as CSV: ${result.filename}`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportPDF}
        disabled={isLoading || type === "billableHours"}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        PDF
      </Button>
      <Button
        onClick={handleExportCSV}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <Sheet className="w-4 h-4" />
        CSV
      </Button>
    </div>
  );
}
