
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

export interface FilterOptions {
  search: string;
  position: string;
  role: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ResponsivePlayerFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  playerCount: number;
  filteredCount: number;
}

const ResponsivePlayerFilters = ({
  filters,
  onFiltersChange,
  playerCount,
  filteredCount
}: ResponsivePlayerFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isMobile, isPortrait } = useDeviceOrientation();

  const activeFiltersCount = [
    filters.position !== 'all',
    filters.role !== 'all',
    filters.search.length > 0
  ].filter(Boolean).length;

  // Mobile portrait - ultra compact
  if (isMobile && isPortrait) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 h-9"
            />
          </div>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Select value={filters.position} onValueChange={(value) => onFiltersChange({ ...filters, position: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={filters.role} onValueChange={(value) => onFiltersChange({ ...filters, role: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="captain">Captain</SelectItem>
                      <SelectItem value="s-class">S-Class</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="substitute">Substitute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contributionScore">Contribution</SelectItem>
                      <SelectItem value="goals">Goals</SelectItem>
                      <SelectItem value="assists">Assists</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onFiltersChange({
                    search: '',
                    position: 'all',
                    role: 'all',
                    sortBy: 'contributionScore',
                    sortOrder: 'desc'
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredCount} of {playerCount} players
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Mobile landscape and tablet - 2-column layout
  if (isMobile && !isPortrait) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filters.position} onValueChange={(value) => onFiltersChange({ ...filters, position: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Select value={filters.role} onValueChange={(value) => onFiltersChange({ ...filters, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="captain">Captain</SelectItem>
              <SelectItem value="s-class">S-Class</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="substitute">Substitute</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contributionScore">Contribution</SelectItem>
              <SelectItem value="goals">Goals</SelectItem>
              <SelectItem value="assists">Assists</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredCount} of {playerCount} players
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({
                search: '',
                position: 'all',
                role: 'all',
                sortBy: 'contributionScore',
                sortOrder: 'desc'
              })}
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Desktop - full layout
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select value={filters.position} onValueChange={(value) => onFiltersChange({ ...filters, position: value })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
            <SelectItem value="defender">Defender</SelectItem>
            <SelectItem value="midfielder">Midfielder</SelectItem>
            <SelectItem value="forward">Forward</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.role} onValueChange={(value) => onFiltersChange({ ...filters, role: value })}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="captain">Captain</SelectItem>
            <SelectItem value="s-class">S-Class</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="substitute">Substitute</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contributionScore">Contribution</SelectItem>
            <SelectItem value="goals">Goals</SelectItem>
            <SelectItem value="assists">Assists</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => onFiltersChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
          className="px-3"
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCount} of {playerCount} players
        </span>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({
                search: '',
                position: 'all',
                role: 'all',
                sortBy: 'contributionScore',
                sortOrder: 'desc'
              })}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsivePlayerFilters;
