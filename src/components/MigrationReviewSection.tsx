import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import reviewRaw from "@/assets/code_migration_review.tex?raw";
import { latexToHtml } from "@/lib/latexToHtml";

type Section = { title: string; html: string };

function splitIntoSections(html: string): Section[] {
  const sections: Section[] = [];
  const regex = /<h2>([^<]+)<\/h2>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let currentTitle: string | null = null;

  while ((match = regex.exec(html))) {
    const title = match[1];
    const start = match.index + match[0].length;
    if (currentTitle !== null) {
      const prevContent = html.slice(lastIndex, match.index).trim();
      sections.push({ title: currentTitle, html: prevContent });
    }
    currentTitle = title;
    lastIndex = start;
  }
  if (currentTitle !== null) {
    const tail = html.slice(lastIndex).trim();
    sections.push({ title: currentTitle, html: tail });
  }
  return sections;
}

const MigrationReviewSection = () => {
  const html = latexToHtml(reviewRaw);
  const sections = splitIntoSections(html);

  return (
    <div className="space-y-6">
      {sections.map((s, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: s.html }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MigrationReviewSection;


