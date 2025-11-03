/*
  Minimal LaTeX-to-HTML converter tailored to the structure used in code_migration_review.tex
  Handles: sections, subsections, paragraphs, bold/emphasis, itemize/enumerate lists,
  and the specific tabularx table present in the document. Non-critical LaTeX commands are stripped.
*/

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeLatexEscapes(input: string): string {
  return input
    .replace(/\\%/g, "%")
    .replace(/\\#/g, "#")
    .replace(/\\_/g, "_");
}

function convertSimpleCommands(input: string): string {
  let output = input;
  // Structural headings
  output = output.replace(/\\section\*?\{([^}]*)\}/g, (_m, t) => `\n<h2>${t}</h2>\n`);
  output = output.replace(/\\subsection\*?\{([^}]*)\}/g, (_m, t) => `\n<h3>${t}</h3>\n`);
  output = output.replace(/\\paragraph\*?\{([^}]*)\}/g, (_m, t) => `\n<h4>${t}</h4>\n`);

  // Inline styles
  output = output.replace(/\\textbf\{([^}]*)\}/g, (_m, t) => `<strong>${t}</strong>`);
  output = output.replace(/\\emph\{([^}]*)\}/g, (_m, t) => `<em>${t}</em>`);

  // Newlines (outside of table context will be further processed later)
  output = output.replace(/\\\n/g, "<br/>");

  return output;
}

function stripPreamble(input: string): string {
  return input
    .replace(/\\documentclass[\s\S]*?\n/g, "")
    .replace(/\\usepackage[\s\S]*?\n/g, "")
    .replace(/\\hypersetup[\s\S]*?\}/g, "")
    .replace(/\\title\{[\s\S]*?\}/g, "")
    .replace(/\\author\{[\s\S]*?\}/g, "")
    .replace(/\\date\{[\s\S]*?\}/g, "")
    .replace(/\\maketitle/g, "")
    .replace(/\\begin\{document\}/g, "")
    .replace(/\\end\{document\}/g, "");
}

function convertLists(input: string): string {
  const lines = input.split(/\r?\n/);
  const html: string[] = [];
  const stack: Array<'ul' | 'ol' | 'table' | 'tabular'> = [];

  const open = (tag: 'ul' | 'ol') => {
    html.push(`<${tag}>`);
    stack.push(tag);
  };
  const close = (tag: 'ul' | 'ol') => {
    // pop until tag found
    let popped: string | undefined;
    while ((popped = stack.pop())) {
      html.push(`</${popped}>`);
      if (popped === tag) break;
    }
  };

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    const trimmed = line.trim();

    // Ignore empty lines
    if (!trimmed) {
      html.push("");
      i++;
      continue;
    }

    // Itemize/Enumerate environments
    if (/\\begin\{itemize\}(?:\[[^\]]*\])?/.test(trimmed)) {
      open('ul'); i++; continue;
    }
    if (/\\begin\{enumerate\}(?:\[[^\]]*\])?/.test(trimmed)) {
      open('ol'); i++; continue;
    }
    if (/\\end\{itemize\}/.test(trimmed)) {
      close('ul'); i++; continue;
    }
    if (/\\end\{enumerate\}/.test(trimmed)) {
      close('ol'); i++; continue;
    }

    if (/^\\item\b/.test(trimmed)) {
      const content = trimmed.replace(/^\\item\s*/, "");
      html.push(`<li>${content}</li>`);
      i++; continue;
    }

    html.push(line);
    i++;
  }

  // Close any unclosed lists
  while (stack.length) {
    const tag = stack.pop() as 'ul' | 'ol';
    html.push(`</${tag}>`);
  }

  return html.join("\n");
}

function convertTable(input: string): string {
  // Convert the specific tabularx table into HTML table
  return input.replace(/\\begin\{table\}[\s\S]*?\\begin\{tabularx}[\s\S]*?\n([\s\S]*?)\\end\{tabularx}[\s\S]*?\\end\{table\}/g,
    (_m, tableBody: string) => {
      // Remove rules and non-row lines
      const cleaned = tableBody
        .replace(/\\renewcommand[\s\S]*?\n/g, "")
        .replace(/\\centering\s*/g, "")
        .replace(/\\toprule\s*/g, "")
        .replace(/\\midrule\s*/g, "")
        .replace(/\\bottomrule\s*/g, "")
        .trim();

      const rows = cleaned
        .split(/\\\\\s*\n/)
        .map((row: string) => row.trim())
        .filter(Boolean);

      if (rows.length === 0) return "";

      const cellsToHtml = (row: string, cellTag: 'th' | 'td') => {
        const cols = row.split(/\s*&\s*/);
        return `<tr>${cols.map(c => `<${cellTag}>${c}</${cellTag}>`).join('')}</tr>`;
      };

      const headerRow = rows[0];
      const bodyRows = rows.slice(1);

      const thead = `<thead>${cellsToHtml(headerRow, 'th')}</thead>`;
      const tbody = `<tbody>${bodyRows.map(r => cellsToHtml(r, 'td')).join('')}</tbody>`;
      return `<div class="overflow-x-auto"><table class="min-w-full text-sm">${thead}${tbody}</table></div>`;
    });
}

function wrapParagraphs(input: string): string {
  // Split by double newlines to paragraphs, skipping lines that already produce block HTML
  const blocks = input.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  return blocks.map(block => {
    if (/^<h[2-4]>/.test(block) ||
        /^<ul>/.test(block) ||
        /^<ol>/.test(block) ||
        /^<table/.test(block) ||
        /^<div class=\"overflow-x-auto\">/.test(block)) {
      return block;
    }
    return `<p>${block}</p>`;
  }).join("\n");
}

export function latexToHtml(latexSource: string): string {
  // Order of operations matters
  let s = latexSource;
  s = stripPreamble(s);
  s = normalizeLatexEscapes(s);
  s = convertTable(s);
  s = convertSimpleCommands(s);
  s = convertLists(s);
  // Remove remaining LaTeX environment markers and options
  s = s.replace(/\\begin\{[^}]+\}(?:\[[^\]]*\])?/g, "");
  s = s.replace(/\\end\{[^}]+\}/g, "");
  // Remove remaining LaTeX commands we do not handle
  s = s.replace(/\\(centering|small|large|normalsize|raggedright|clearpage)\b.*\n/g, "");
  // Remove stray command sequences like \item that may remain, including those glued to text
  s = s.replace(/^\\item\s*/gm, "");
  s = s.replace(/\\item\s+/g, "");
  // Clean stray braces
  s = s.replace(/\{\}/g, "");
  s = wrapParagraphs(s);
  // Unescape basic HTML entities after structural conversion to preserve symbols
  s = s.replace(/~\\/g, "");
  return s;
}


