import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';

const marked = new Marked({
  renderer: {
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
  const source = await readFile(path.join(process.cwd(), 'content', 'yazilar', `${slug}.md`), 'utf8');
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
