import DashboardLayout from '@/components/DashboardLayout';
import AdvancedSearch from '@/components/AdvancedSearch';

export default function AdvancedSearchPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Search</h1>
          <p className="text-slate-400">Search and filter contracts with AI-powered clause categorization</p>
        </div>
        <AdvancedSearch />
      </div>
    </DashboardLayout>
  );
}
