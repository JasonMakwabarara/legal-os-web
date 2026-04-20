import { Sidebar } from './Sidebar';

/**
 * Main Layout Component
 * Design Philosophy: Modern Professional with Legal Authority
 * - Sidebar navigation on left
 * - Main content area with responsive padding
 * - Consistent spacing and structure
 */
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
