import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, GitBranch, Clock } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  lastUpdated: string;
  stars?: number;
  version?: string;
  url?: string;
  features?: string[];
}

const ToolCard = ({ 
  title, 
  description, 
  category, 
  lastUpdated, 
  stars, 
  version, 
  url,
  features = []
}: ToolCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-smooth gradient-card border animate-fade-in">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg group-hover:text-primary transition-smooth">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {version && (
                <Badge variant="outline" className="text-xs">
                  v{version}
                </Badge>
              )}
            </div>
          </div>
          
          {stars && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Star className="w-4 h-4 fill-current text-warning" />
              <span className="text-sm">{stars.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{lastUpdated}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <GitBranch className="w-4 h-4 mr-2" />
              Details
            </Button>
            {url && (
              <Button size="sm" variant="outline" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;