export type Strategy = 'fixed' | 'recursive' | 'sentence';

export type Chunk = {
  index: number;
  start: number;
  end: number;
  text: string;
};

/** A run of text covered by the same set of chunks (more than one = overlap). */
export type Segment = {
  start: number;
  end: number;
  chunks: number[];
};

type Span = { start: number; end: number };

// LangChain's RecursiveCharacterTextSplitter defaults: paragraph, line, word, character.
export const RECURSIVE_SEPARATORS = ['\n\n', '\n', ' ', ''];

export function chunkText(text: string, strategy: Strategy, size: number, overlap: number): Chunk[] {
  if (text.length === 0) return [];

  const chunkSize = Math.max(1, Math.floor(size));
  const chunkOverlap = Math.min(Math.max(0, Math.floor(overlap)), chunkSize - 1);
  const whole = { start: 0, end: text.length };

  let spans: Span[];
  if (strategy === 'fixed') {
    // Raw windows on purpose: this strategy is meant to show words being cut.
    spans = fixedWindows(whole, chunkSize, chunkOverlap);
  } else {
    const split =
      strategy === 'recursive'
        ? recursiveSplit(text, whole, RECURSIVE_SEPARATORS, chunkSize, chunkOverlap)
        : sentenceSplit(text, chunkSize, chunkOverlap);
    spans = split.map((span) => trimSpan(text, span));
  }

  return spans
    .filter((span) => span.end > span.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .map((span, index) => ({ index, ...span, text: text.slice(span.start, span.end) }));
}

function fixedWindows(span: Span, size: number, overlap: number): Span[] {
  const step = size - overlap;
  const windows: Span[] = [];
  for (let start = span.start; start < span.end; start += step) {
    const end = Math.min(start + size, span.end);
    windows.push({ start, end });
    if (end === span.end) break;
  }
  return windows;
}

// Splits on `separator` and keeps it at the end of the preceding piece, so pieces cover the span without gaps.
function splitKeepingSeparator(text: string, span: Span, separator: string): Span[] {
  const segment = text.slice(span.start, span.end);
  const pieces: Span[] = [];
  let cursor = 0;
  let index = segment.indexOf(separator);
  while (index !== -1) {
    const end = index + separator.length;
    pieces.push({ start: span.start + cursor, end: span.start + end });
    cursor = end;
    index = segment.indexOf(separator, cursor);
  }
  if (cursor < segment.length) pieces.push({ start: span.start + cursor, end: span.end });
  return pieces;
}

// Packs consecutive pieces into chunks of at most `size`, carrying up to `overlap` characters of whole pieces forward.
function mergeSpans(pieces: Span[], size: number, overlap: number): Span[] {
  const chunks: Span[] = [];
  let current: Span[] = [];
  let total = 0;

  for (const piece of pieces) {
    const length = piece.end - piece.start;
    if (current.length > 0 && total + length > size) {
      chunks.push({ start: current[0].start, end: current[current.length - 1].end });
      while (current.length > 0 && (total > overlap || total + length > size)) {
        total -= current[0].end - current[0].start;
        current.shift();
      }
    }
    current.push(piece);
    total += length;
  }

  if (current.length > 0) chunks.push({ start: current[0].start, end: current[current.length - 1].end });
  return chunks;
}

function recursiveSplit(text: string, span: Span, separators: string[], size: number, overlap: number): Span[] {
  const segment = text.slice(span.start, span.end);
  const separatorIndex = separators.findIndex((separator) => separator === '' || segment.includes(separator));
  if (separatorIndex === -1) return [span];

  const separator = separators[separatorIndex];
  if (separator === '') return fixedWindows(span, size, overlap);

  const remaining = separators.slice(separatorIndex + 1);
  const result: Span[] = [];
  let fitting: Span[] = [];

  for (const piece of splitKeepingSeparator(text, span, separator)) {
    if (piece.end - piece.start <= size) {
      fitting.push(piece);
      continue;
    }
    if (fitting.length > 0) {
      result.push(...mergeSpans(fitting, size, overlap));
      fitting = [];
    }
    result.push(...recursiveSplit(text, piece, remaining, size, overlap));
  }

  if (fitting.length > 0) result.push(...mergeSpans(fitting, size, overlap));
  return result;
}

function sentenceSpans(text: string): Span[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('tr', { granularity: 'sentence' });
    return Array.from(segmenter.segment(text), ({ index, segment }) => ({
      start: index,
      end: index + segment.length,
    }));
  }

  const spans: Span[] = [];
  let cursor = 0;
  for (const match of text.matchAll(/[.!?…]+\s+/g)) {
    const end = (match.index ?? 0) + match[0].length;
    spans.push({ start: cursor, end });
    cursor = end;
  }
  if (cursor < text.length) spans.push({ start: cursor, end: text.length });
  return spans;
}

// Groups whole sentences; a sentence longer than `size` on its own is split at word boundaries.
function sentenceSplit(text: string, size: number, overlap: number): Span[] {
  const result: Span[] = [];
  let fitting: Span[] = [];

  for (const sentence of sentenceSpans(text)) {
    if (sentence.end - sentence.start <= size) {
      fitting.push(sentence);
      continue;
    }
    if (fitting.length > 0) {
      result.push(...mergeSpans(fitting, size, overlap));
      fitting = [];
    }
    result.push(...recursiveSplit(text, sentence, [' ', ''], size, overlap));
  }

  if (fitting.length > 0) result.push(...mergeSpans(fitting, size, overlap));
  return result;
}

function trimSpan(text: string, span: Span): Span {
  let { start, end } = span;
  while (start < end && /\s/.test(text[start])) start++;
  while (end > start && /\s/.test(text[end - 1])) end--;
  return { start, end };
}

export function buildSegments(textLength: number, chunks: Chunk[]): Segment[] {
  const boundaries = new Set([0, textLength]);
  for (const chunk of chunks) {
    boundaries.add(chunk.start);
    boundaries.add(chunk.end);
  }
  const points = [...boundaries].sort((a, b) => a - b);

  const segments: Segment[] = [];
  let next = 0;
  let active: Chunk[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    while (next < chunks.length && chunks[next].start <= start) active.push(chunks[next++]);
    active = active.filter((chunk) => chunk.end > start);
    segments.push({ start, end: points[i + 1], chunks: active.map((chunk) => chunk.index) });
  }
  return segments;
}

export function chunkStats(chunks: Chunk[], segments: Segment[]) {
  if (chunks.length === 0) return null;

  const lengths = chunks.map((chunk) => chunk.end - chunk.start);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const covered = segments.reduce(
    (sum, segment) => (segment.chunks.length > 0 ? sum + segment.end - segment.start : sum),
    0,
  );

  return {
    count: chunks.length,
    average: Math.round(total / chunks.length),
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    // Extra text stored because of overlap, relative to the unique text the chunks cover
    duplication: covered > 0 ? (total - covered) / covered : 0,
  };
}
