import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked, type Tokens } from 'marked';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'yazilar');

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// A paragraph that holds a single image becomes a figure, its title the caption. Local art (an SVG or an
// HTML fragment of SVG panels next to the post) is inlined so it picks up the page fonts.
function figure({ href, title, text }: Tokens.Image) {
  const art = /^https?:\/\//.test(href)
    ? `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy" />`
    : readFileSync(path.join(CONTENT_DIR, href), 'utf8');
  const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : '';
  return `<figure><div data-art>${art}</div>${caption}</figure>\n`;
}

const marked = new Marked({
  renderer: {
    paragraph({ tokens }) {
      const content = tokens.filter((token) => !(token.type === 'text' && !token.raw.trim()));
      if (content.length === 1 && content[0].type === 'image') return figure(content[0] as Tokens.Image);
      return false;
    },
    // External links open in a new tab; site links stay in place
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${title ? ` title="${title}"` : ''}${external}>${text}</a>`;
    },
  },
  hooks: {
    // Wide tables scroll inside their own frame instead of widening the page
    postprocess: (html) => html.replaceAll('<table>', '<div data-table><table>').replaceAll('</table>', '</table></div>'),
  },
});

const WORDS_PER_MINUTE = 200;

export async function loadPost(slug: string) {
  const source = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8');
  const words = source.split(/\s+/).filter(Boolean).length;
  return {
    html: await marked.parse(source),
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}

const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}
