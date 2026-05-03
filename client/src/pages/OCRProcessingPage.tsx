import DashboardLayout from '@/components/DashboardLayout';
import DocumentUploadWidget from '@/components/DocumentUploadWidget';

export default function OCRProcessingPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">OCR Processing</h1>
          <p className="text-slate-400">Upload and process documents with optical character recognition</p>
        </div>
        <DocumentUploadWidget />
      </div>
    </DashboardLayout>
  );
}
