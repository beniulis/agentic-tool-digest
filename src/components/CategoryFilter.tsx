import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className="transition-smooth"
      >
        All Tools
        <Badge variant="secondary" className="ml-2 text-xs">
          {categories.length}
        </Badge>
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className="transition-smooth"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;