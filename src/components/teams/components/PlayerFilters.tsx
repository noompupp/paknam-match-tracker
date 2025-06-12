
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  search: string;
  position: string;
  role: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PlayerFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  playerCount: number;
  filteredCount: number;
  className?: string;
}

const PlayerFilters = ({ 
  filters, 
  onFiltersChange, 
  playerCount, 
  filteredCount,
  className 
}: PlayerFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      position: 'all',
      role: 'all',
      sortBy: 'contributionScore',
      sortOrder: 'desc'
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.search || 
    filters.position !== 'all' || 
    filters.role !== 'all' ||
    filters.sortBy !== 'contributionScore' ||
    filters.sortOrder !== 'desc';

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {[filters.search, filters.position !== 'all' ? 1 : 0, filters.role !== 'all' ? 1 : 0]
                  .filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Position Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select value={filters.position} onValueChange={(value) => handleFilterChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All positions" />
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

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
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

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contributionScore">Contribution Score</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="assists">Assists</SelectItem>
                  <SelectItem value="matches_played">Matches Played</SelectItem>
                  <SelectItem value="total_minutes_played">Minutes Played</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="w-full justify-start"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {filters.sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCount} of {playerCount} players
        </span>
        {hasActiveFilters && (
          <span className="text-primary">Filters active</span>
        )}
      </div>
    </div>
  );
};

export default PlayerFilters;
