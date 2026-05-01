import DashboardLayout from '@/components/DashboardLayout';
import ClauseComparison from '@/components/ClauseComparison';

export default function ClauseComparisonPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Clause Comparison</h1>
          <p className="text-slate-400">Compare clauses across multiple documents with AI-powered risk analysis</p>
        </div>
        <ClauseComparison />
      </div>
    </DashboardLayout>
  );
}
