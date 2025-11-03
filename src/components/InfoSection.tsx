import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import reviewRaw from "@/assets/code_migration_review.tex?raw";

const InfoSection = () => {
  return (
    <section id="info-section" className="py-16 lg:py-24 bg-muted/10">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Code Migration Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm md:text-base">
              {reviewRaw}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InfoSection;


