import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Plus, CheckCircle2, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  customTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  onCustomTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

const TagSelector = ({
  availableTags,
  selectedTags,
  customTags,
  onSelectedTagsChange,
  onCustomTagsChange,
  disabled = false
}: TagSelectorProps) => {
  const [newTag, setNewTag] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectedTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onSelectedTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !customTags.includes(trimmed) && !availableTags.includes(trimmed)) {
      onCustomTagsChange([...customTags, trimmed]);
      onSelectedTagsChange([...selectedTags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    onCustomTagsChange(customTags.filter(t => t !== tag));
    onSelectedTagsChange(selectedTags.filter(t => t !== tag));
  };

  const handleSelectAll = () => {
    onSelectedTagsChange([...availableTags, ...customTags]);
  };

  const handleDeselectAll = () => {
    onSelectedTagsChange([]);
  };

  const allTags = [...availableTags, ...customTags];
  const displayedTags = showAll ? availableTags : availableTags.slice(0, 12);
  const hasMore = availableTags.length > 12;

  return (
    <div className="space-y-4">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Selected: {selectedTags.length} / {allTags.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || selectedTags.length === allTags.length}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={disabled || selectedTags.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Tags grid */}
      <ScrollArea className={showAll ? "h-64" : "h-auto"}>
        <div className="flex flex-wrap gap-2 p-1">
          {displayedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Button
                key={tag}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleTag(tag)}
                disabled={disabled}
                className="transition-smooth"
              >
                {isSelected ? (
                  <CheckCircle2 className="h-3 w-3 mr-1.5" />
                ) : (
                  <Circle className="h-3 w-3 mr-1.5" />
                )}
                {tag}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Show more/less toggle */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          disabled={disabled}
          className="w-full"
        >
          {showAll ? "Show Less" : `Show ${availableTags.length - 12} More Tags`}
        </Button>
      )}

      {/* Custom tags section */}
      {customTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Custom Tags:</p>
          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer group"
                onClick={() => !disabled && handleToggleTag(tag)}
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    !disabled && handleRemoveCustomTag(tag);
                  }}
                  className="ml-1.5 hover:text-destructive"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add custom tag input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddCustomTag()}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleAddCustomTag}
          disabled={disabled || !newTag.trim()}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default TagSelector;
