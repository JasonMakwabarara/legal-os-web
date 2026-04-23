import { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Briefcase, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Global Search Component
 * Allows quick search across contracts, cases, and clients
 * Supports Cmd+K / Ctrl+K keyboard shortcut
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  // Search contracts
  const { data: contractResults = [], isLoading: contractsLoading } = trpc.contracts.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Search cases
  const { data: caseResults = [], isLoading: casesLoading } = trpc.cases.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Search clients
  const { data: clientResults = [], isLoading: clientsLoading } = trpc.clients.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const isLoading = contractsLoading || casesLoading || clientsLoading;

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (type: string, id: number) => {
    if (type === 'contract') {
      setLocation(`/contract/${id}`);
    } else if (type === 'case') {
      setLocation(`/cases/${id}`);
    } else if (type === 'client') {
      setLocation(`/clients/${id}`);
    }
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, cases, clients... (Cmd+K)"
            className="pl-10 bg-secondary/50"
            onClick={() => setOpen(true)}
            readOnly
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : searchQuery.length === 0 ? (
              <CommandEmpty>Start typing to search...</CommandEmpty>
            ) : (
              <>
                {contractResults.length > 0 && (
                  <CommandGroup heading="Contracts">
                    {contractResults.map((contract: any) => (
                      <CommandItem
                        key={`contract-${contract.id}`}
                        onSelect={() => handleSelect('contract', contract.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{contract.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {contract.status}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {caseResults.length > 0 && (
                  <CommandGroup heading="Cases">
                    {caseResults.map((caseItem: any) => (
                      <CommandItem
                        key={`case-${caseItem.id}`}
                        onSelect={() => handleSelect('case', caseItem.id)}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{caseItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {caseItem.status}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {clientResults.length > 0 && (
                  <CommandGroup heading="Clients">
                    {clientResults.map((client: any) => (
                      <CommandItem
                        key={`client-${client.id}`}
                        onSelect={() => handleSelect('client', client.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.type}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!isLoading &&
                  contractResults.length === 0 &&
                  caseResults.length === 0 &&
                  clientResults.length === 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
