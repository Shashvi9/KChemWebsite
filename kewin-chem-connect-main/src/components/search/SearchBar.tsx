import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const SearchBar = ({ className = 'hidden lg:flex', onSearch }: { className?: string; onSearch?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onSearch?.();
    }
  };

  return (
    <form onSubmit={handleSearch} role="search" className={`${className} items-center`}>
      <div className="relative w-full lg:w-64">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          aria-label="Search products by name or CAS number"
          placeholder="Search by name or CAS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 border-input focus:border-ring focus:ring-ring"
        />
      </div>
    </form>
  );
};