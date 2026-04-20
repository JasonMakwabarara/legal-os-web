import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Navigation Sidebar Component
 * Design Philosophy: Modern Professional with Legal Authority
 * - Clean navigation structure
 * - Quick access to main modules
 * - Responsive mobile menu
 */
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Cases', path: '/cases', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Clients', path: '/clients', icon: <Users className="w-5 h-5" /> },
  { label: 'Documents', path: '/documents', icon: <FileText className="w-5 h-5" /> },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-lg"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Legal OS</h2>
          <p className="text-xs text-muted-foreground mt-1">Powered by SpiderNetOS</p>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                isActive(item.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-secondary'
              }`}
              onClick={() => {
                setLocation(item.path);
                setIsOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-secondary">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-secondary">
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
