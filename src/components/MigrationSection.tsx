import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import reviewRaw from "@/assets/code_migration_review.tex?raw";
import { latexToHtml } from "@/lib/latexToHtml";

const MigrationSection = () => {
  const html = latexToHtml(reviewRaw);
  return (
    <section id="migration" className="py-16 lg:py-24 bg-muted/10 hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Migration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MigrationSection;


