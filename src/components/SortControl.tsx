import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, Star } from "lucide-react";

export type SortOption = "stars" | "discoveredAt" | "name";

interface SortControlProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
  { value: "stars" as SortOption, label: "Popularity", icon: Star },
  { value: "discoveredAt" as SortOption, label: "Discovered by Agents", icon: Calendar },
  { value: "name" as SortOption, label: "Name", icon: ArrowUpDown },
];

const SortControl = ({ activeSort, onSortChange }: SortControlProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border border-border/50">
      <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
        <ArrowUpDown className="h-4 w-4 mr-1" />
        Sort by:
      </div>

      {sortOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            variant={activeSort === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange(option.value)}
            className="transition-smooth"
          >
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default SortControl;
