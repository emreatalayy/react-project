'use client';

import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { Check, Copy, Download, FileUp, Info, RotateCcw, Trash2 } from 'lucide-react';
import { copyToClipboard } from '../../components/clipboard';
import { clamp, countWords, highlightColor, numberFormat, panel, panelTitle, percentFormat, smallButton, Stat } from '../shared';
import { buildSegments, chunkStats, chunkText, type Chunk, type Segment, type Strategy } from './chunking';
import { SAMPLE_TEXT } from './sampleText';

const BAR_COLOR = '#3987e5';
const MAX_CHARS = 200_000;
const MAX_FILE_BYTES = 1_000_000;

const STRATEGIES: { value: Strategy; label: string; description: string }[] = [
  {
    value: 'recursive',
    label: 'Özyinelemeli',
    description:
      "Önce paragraflardan, sonra satırlardan, en son kelimelerden böler. LangChain'deki RecursiveCharacterTextSplitter'ın varsayılan davranışı; çoğu RAG projesi için iyi bir başlangıç.",
  },
  {
    value: 'sentence',
    label: 'Cümle',
    description:
      'Cümleleri bölmeden gruplar. Tek başına sınırı aşan bir cümle olursa o cümle kelime sınırından bölünür.',
  },
  {
    value: 'fixed',
    label: 'Sabit boyut',
    description: 'Metni tam olarak belirlenen karakter sayısında keser. En hızlısı ama kelimeleri ve cümleleri ortadan bölebilir.',
  },
];

const SEPARATORS = [
  { symbol: '\\n\\n', name: 'paragraf' },
  { symbol: '\\n', name: 'satır' },
  { symbol: '␣', name: 'kelime' },
  { symbol: '""', name: 'karakter' },
];

const overlapMark =
  'rounded-[3px] bg-white/20 text-zinc-100 underline decoration-zinc-300 decoration-2 underline-offset-[5px] [box-decoration-break:clone]';

export function ChunkVisualizer() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [strategy, setStrategy] = useState<Strategy>('recursive');
  const [size, setSize] = useState(300);
  const [overlap, setOverlap] = useState(50);
  const [view, setView] = useState<'text' | 'list'>('text');
  const [active, setActive] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const fileInput = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const maxOverlap = Math.floor(size / 2);
  const effectiveOverlap = Math.min(overlap, maxOverlap);

  // Deferred inputs keep the sliders responsive on long documents
  const deferredText = useDeferredValue(text);
  const deferredStrategy = useDeferredValue(strategy);
  const deferredSize = useDeferredValue(size);
  const deferredOverlap = useDeferredValue(effectiveOverlap);
  const isStale =
    deferredText !== text ||
    deferredStrategy !== strategy ||
    deferredSize !== size ||
    deferredOverlap !== effectiveOverlap;

  const chunks = useMemo(
    () => chunkText(deferredText, deferredStrategy, deferredSize, deferredOverlap),
    [deferredText, deferredStrategy, deferredSize, deferredOverlap],
  );
  const segments = useMemo(() => buildSegments(deferredText.length, chunks), [deferredText.length, chunks]);
  const stats = useMemo(() => chunkStats(chunks, segments), [chunks, segments]);
  const overlapSkipped =
    deferredStrategy !== 'fixed' && deferredOverlap > 0 && chunks.length > 1 && stats?.duplication === 0;

  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = setTimeout(() => setCopyState('idle'), 2200);
    return () => clearTimeout(timeout);
  }, [copyState]);

  function updateText(value: string) {
    if (value.length > MAX_CHARS) {
      setNotice(`Metin çok uzun; ilk ${numberFormat.format(MAX_CHARS)} karakter kullanılıyor.`);
      setText(value.slice(0, MAX_CHARS));
      return;
    }
    setNotice(null);
    setText(value);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setNotice('Dosya çok büyük; en fazla 1 MB metin dosyası yükleyebilirsin.');
      return;
    }
    updateText(await file.text());
  }

  function chunksAsJson() {
    return JSON.stringify(
      chunks.map((chunk) => ({
        id: chunk.index + 1,
        start: chunk.start,
        end: chunk.end,
        characters: chunk.end - chunk.start,
        text: chunk.text,
      })),
      null,
      2,
    );
  }

  async function copyJson() {
    setCopyState((await copyToClipboard(chunksAsJson())) ? 'copied' : 'failed');
  }

  function downloadJson() {
    const url = URL.createObjectURL(new Blob([chunksAsJson()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chunks.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function revealChunk(index: number) {
    viewport.current
      ?.querySelector(`[data-chunk-anchor="${index}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const currentStrategy = STRATEGIES.find((option) => option.value === strategy) ?? STRATEGIES[0];

  return (
    <div className="mt-10 space-y-4">
      {/* Metin */}
      <section className={`${panel} fade-up`} style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={panelTitle}>
            <label htmlFor="chunk-text">Metin</label>
          </h2>
          <p className="text-xs text-zinc-400">
            {numberFormat.format(text.length)} karakter · {numberFormat.format(countWords(text))} kelime
          </p>
        </div>
        <textarea
          id="chunk-text"
          value={text}
          onChange={(event) => updateText(event.target.value)}
          spellCheck={false}
          placeholder="Bölmek istediğin metni buraya yapıştır…"
          className="mt-3 h-36 w-full resize-y sm:h-44 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-zinc-200 placeholder:text-zinc-400 focus:border-sky-400/50 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => fileInput.current?.click()} className={smallButton}>
            <FileUp aria-hidden="true" className="size-4" />
            Dosya yükle
          </button>
          <button type="button" onClick={() => updateText(SAMPLE_TEXT)} className={smallButton}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Örnek metin
          </button>
          <button type="button" onClick={() => updateText('')} className={smallButton}>
            <Trash2 aria-hidden="true" className="size-4" />
            Temizle
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.md,.markdown,.csv,.json,.html,text/plain"
            onChange={handleFile}
            className="hidden"
          />
          <span className="text-xs text-zinc-400">.txt, .md, .csv, .json</span>
        </div>
        {notice && (
          <p role="status" className="mt-3 text-xs text-amber-300">
            {notice}
          </p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Ayarlar */}
        <section
          className={`${panel} fade-up lg:sticky lg:top-24 lg:self-start`}
          style={{ animationDelay: '140ms' }}
        >
          <h2 className={panelTitle}>Ayarlar</h2>

          <fieldset className="mt-4">
            <legend className="text-sm text-zinc-300">Bölme yöntemi</legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-black/30 p-1 ring-1 ring-white/10">
              {STRATEGIES.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="strategy"
                    value={option.value}
                    checked={strategy === option.value}
                    onChange={() => setStrategy(option.value)}
                    className="peer sr-only"
                  />
                  <span className="block cursor-pointer rounded-xl px-1.5 py-2 text-center text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100 peer-checked:bg-white/10 peer-checked:text-white peer-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] peer-focus-visible:outline-2 peer-focus-visible:outline-sky-400">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">{currentStrategy.description}</p>
          </fieldset>

          <RangeField
            id="chunk-size"
            label="Chunk boyutu"
            value={size}
            min={50}
            max={2000}
            step={10}
            onChange={setSize}
          />
          <RangeField
            id="chunk-overlap"
            label="Overlap"
            value={effectiveOverlap}
            min={0}
            max={maxOverlap}
            step={5}
            hint={`En fazla chunk boyutunun yarısı (${numberFormat.format(maxOverlap)})`}
            onChange={setOverlap}
          />

          {strategy === 'recursive' && (
            <div className="mt-5">
              <p className="text-sm text-zinc-300">Ayırıcılar (sırayla)</p>
              <ol className="mt-2 flex flex-wrap gap-1.5">
                {SEPARATORS.map((separator) => (
                  <li
                    key={separator.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-zinc-300"
                  >
                    <code className="font-mono text-sky-200">{separator.symbol}</code>
                    {separator.name}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* Sonuçlar */}
        <div
          className={`fade-up min-w-0 space-y-4 transition-opacity duration-200 ${isStale ? 'opacity-60' : ''}`}
          style={{ animationDelay: '200ms' }}
        >
          {stats ? (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Chunk sayısı" value={numberFormat.format(stats.count)} />
                <Stat label="Ortalama boyut" value={numberFormat.format(stats.average)} unit="karakter" />
                <Stat
                  label="En kısa / en uzun"
                  value={`${numberFormat.format(stats.min)} / ${numberFormat.format(stats.max)}`}
                />
                <Stat
                  label="Overlap tekrarı"
                  value={stats.duplication > 0 ? `+${percentFormat.format(stats.duplication)}` : '0'}
                />
              </dl>

              {overlapSkipped && (
                <p className="flex gap-2.5 rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4 text-[13px] leading-relaxed text-sky-100/90">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sky-300" />
                  <span>
                    {`Bu ayarda overlap oluşmadı. Overlap, bölünmüş parçalar bütün halinde taşınarak yapılır; buradaki parçalar ${numberFormat.format(deferredOverlap)} karakterden uzun olduğu için hiçbiri sığmadı. Overlap'i büyütmeyi ya da özyinelemeli yöntemi dene.`}
                  </span>
                </p>
              )}

              <section className={panel}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className={panelTitle}>Chunk boyutları</h2>
                  <p className="text-xs text-zinc-400">
                    Karakter · sınır {numberFormat.format(deferredSize)} · çubuğa tıkla, metinde bul
                  </p>
                </div>
                <SizeChart
                  chunks={chunks}
                  limit={deferredSize}
                  active={active}
                  onActivate={setActive}
                  onSelect={revealChunk}
                />
              </section>

              <section className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div role="tablist" aria-label="Görünüm" className="inline-flex rounded-full bg-black/30 p-1 ring-1 ring-white/10">
                    {(
                      [
                        ['text', 'Metin görünümü'],
                        ['list', 'Chunk listesi'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={view === value}
                        aria-controls="chunk-view"
                        onClick={() => setView(value)}
                        className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                          view === value ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyJson} className={smallButton} aria-live="polite">
                      {copyState === 'copied' ? (
                        <Check aria-hidden="true" className="size-4 text-emerald-300" />
                      ) : (
                        <Copy aria-hidden="true" className="size-4" />
                      )}
                      {copyState === 'copied'
                        ? 'Kopyalandı'
                        : copyState === 'failed'
                          ? 'Kopyalanamadı, İndir’i kullan'
                          : 'JSON kopyala'}
                    </button>
                    <button type="button" onClick={downloadJson} className={smallButton}>
                      <Download aria-hidden="true" className="size-4" />
                      İndir
                    </button>
                  </div>
                </div>

                {view === 'text' && <Legend />}

                <div
                  ref={viewport}
                  id="chunk-view"
                  role="tabpanel"
                  className="mt-4 max-h-[28rem] overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/30 p-3 sm:max-h-[36rem] sm:p-5"
                >
                  {view === 'text' ? (
                    <TextView text={deferredText} chunks={chunks} segments={segments} active={active} onActivate={setActive} />
                  ) : (
                    <ChunkList text={deferredText} chunks={chunks} active={active} onActivate={setActive} />
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className={`${panel} flex flex-col items-center py-16 text-center`}>
              <p className="font-medium text-zinc-100">Görselleştirilecek metin yok</p>
              <p className="mt-1.5 text-sm text-zinc-400">Yukarıya bir metin yapıştır ya da örnek metinle başla.</p>
              <button type="button" onClick={() => updateText(SAMPLE_TEXT)} className={`${smallButton} mt-5`}>
                <RotateCcw aria-hidden="true" className="size-4" />
                Örnek metni yükle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  // Typed drafts are committed once they are in range, so typing "120" isn't clamped at "1"
  const [draft, setDraft] = useState<string | null>(null);

  function commitDraft() {
    if (draft === null) return;
    const parsed = Number(draft);
    onChange(draft === '' || Number.isNaN(parsed) ? value : clamp(Math.round(parsed), min, max));
    setDraft(null);
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm text-zinc-300">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            aria-label={`${label} (karakter)`}
            value={draft ?? String(value)}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              const parsed = Number(next);
              if (next !== '' && parsed >= min && parsed <= max) onChange(parsed);
            }}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right font-mono text-sm tabular-nums text-zinc-100 focus:border-sky-400/50 focus:outline-none"
          />
          <span className="text-xs text-zinc-400">karakter</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
        className="mt-3 w-full accent-sky-400"
      />
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function SizeChart({
  chunks,
  limit,
  active,
  onActivate,
  onSelect,
}: {
  chunks: Chunk[];
  limit: number;
  active: number[];
  onActivate: (indexes: number[]) => void;
  onSelect: (index: number) => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLButtonElement | null)[]>([]);
  const [tooltip, setTooltip] = useState<{ index: number; x: number } | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const rovingIndex = Math.min(focusIndex, chunks.length - 1);

  function show(index: number, bar: HTMLElement) {
    const bounds = wrapper.current?.getBoundingClientRect();
    if (!bounds) return;
    const rect = bar.getBoundingClientRect();
    setTooltip({ index, x: clamp(rect.left + rect.width / 2 - bounds.left, 72, bounds.width - 72) });
    onActivate([index]);
  }

  function hide() {
    setTooltip(null);
    onActivate([]);
  }

  // Roving tabindex: one tab stop for the whole chart, arrow keys move between bars
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: rovingIndex + 1,
      ArrowLeft: rovingIndex - 1,
      Home: 0,
      End: chunks.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = clamp(moves[event.key], 0, chunks.length - 1);
    setFocusIndex(next);
    bars.current[next]?.focus();
  }

  const hovered = tooltip ? chunks[tooltip.index] : undefined;

  return (
    <div ref={wrapper} className="relative mt-5" onPointerLeave={hide}>
      {tooltip && hovered && (
        <div
          role="tooltip"
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)]"
          style={{ left: tooltip.x }}
        >
          <p className="text-sm font-semibold text-zinc-50">
            {numberFormat.format(hovered.end - hovered.start)} karakter
          </p>
          <p className="text-xs text-zinc-400">
            Chunk {hovered.index + 1} · {numberFormat.format(countWords(hovered.text))} kelime
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex h-32 flex-col justify-between text-right font-mono text-[10px] tabular-nums leading-none text-zinc-400"
        >
          <span>{numberFormat.format(limit)}</span>
          <span>0</span>
        </div>
        <div className="relative h-32 min-w-0 flex-1">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-white/10" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-white/20" />
          <div
            role="group"
            aria-label="Chunk boyutları; ok tuşlarıyla gezinebilirsin"
            onKeyDown={handleKeyDown}
            className="absolute inset-0 flex items-end gap-[2px] overflow-x-auto"
          >
            {chunks.map((chunk) => {
              const length = chunk.end - chunk.start;
              const isActive = active.includes(chunk.index);
              const style: CSSProperties = {
                height: `${Math.max(2, (length / limit) * 100)}%`,
                backgroundColor: BAR_COLOR,
                opacity: active.length > 0 && !isActive ? 0.35 : 1,
                filter: isActive ? 'brightness(1.3)' : undefined,
              };
              return (
                <button
                  key={chunk.index}
                  ref={(element) => {
                    bars.current[chunk.index] = element;
                  }}
                  type="button"
                  tabIndex={chunk.index === rovingIndex ? 0 : -1}
                  aria-label={`Chunk ${chunk.index + 1}: ${length} karakter`}
                  onPointerEnter={(event) => show(chunk.index, event.currentTarget)}
                  onFocus={(event) => {
                    setFocusIndex(chunk.index);
                    show(chunk.index, event.currentTarget);
                  }}
                  onBlur={hide}
                  onClick={() => onSelect(chunk.index)}
                  className="flex h-full min-w-1 max-w-6 flex-1 items-end"
                >
                  <span className="w-full rounded-t-[4px] transition-[opacity,filter] duration-150" style={style} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-400">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="flex gap-0.5">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-3 w-2 rounded-sm" style={{ backgroundColor: highlightColor(index, 0.6) }} />
          ))}
        </span>
        Chunk&apos;lar (sırayla renklenir)
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-5 rounded-sm border-b-2 border-zinc-300 bg-white/20" />
        Overlap: iki chunk&apos;ta ortak
      </li>
      <li className="flex items-center gap-2">
        <ChunkMarker index={2} />
        Chunk başlangıcı
      </li>
    </ul>
  );
}

function ChunkMarker({ index, anchor = false }: { index: number; anchor?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-chunk-anchor={anchor ? index : undefined}
      className="mx-[3px] inline-block -translate-y-px select-none rounded-[4px] bg-white/10 px-1 font-sans text-[10px] font-semibold leading-4 text-zinc-200 ring-1 ring-white/10"
    >
      {index + 1}
    </span>
  );
}

function TextView({
  text,
  chunks,
  segments,
  active,
  onActivate,
}: {
  text: string;
  chunks: Chunk[];
  segments: Segment[];
  active: number[];
  onActivate: (indexes: number[]) => void;
}) {
  const startsAt = useMemo(() => {
    const starts = new Map<number, number[]>();
    for (const chunk of chunks) starts.set(chunk.start, [...(starts.get(chunk.start) ?? []), chunk.index]);
    return starts;
  }, [chunks]);

  return (
    <p
      className="whitespace-pre-wrap break-words font-mono text-[13px] leading-7 text-zinc-100"
      onPointerLeave={() => onActivate([])}
    >
      {segments.map((segment) => {
        const covering = segment.chunks;
        const isActive = covering.some((index) => active.includes(index));
        let style: CSSProperties | undefined;
        let className = 'rounded-[3px] [box-decoration-break:clone]';
        if (covering.length === 1) {
          style = { backgroundColor: highlightColor(covering[0], isActive ? 0.55 : 0.32) };
        } else if (covering.length > 1) {
          style = { backgroundColor: `rgba(255, 255, 255, ${isActive ? 0.3 : 0.2})` };
          className += ' underline decoration-zinc-300 decoration-2 underline-offset-[5px]';
        } else {
          className = 'text-zinc-400';
        }

        return (
          <Fragment key={segment.start}>
            {startsAt.get(segment.start)?.map((index) => <ChunkMarker key={index} index={index} anchor />)}
            <span
              className={className}
              style={style}
              onPointerEnter={covering.length > 0 ? () => onActivate(covering) : undefined}
            >
              {text.slice(segment.start, segment.end)}
            </span>
          </Fragment>
        );
      })}
    </p>
  );
}

function ChunkList({
  text,
  chunks,
  active,
  onActivate,
}: {
  text: string;
  chunks: Chunk[];
  active: number[];
  onActivate: (indexes: number[]) => void;
}) {
  return (
    <ol className="space-y-3" onPointerLeave={() => onActivate([])}>
      {chunks.map((chunk, position) => {
        const previous = chunks[position - 1];
        const next = chunks[position + 1];
        const headEnd = previous ? clamp(previous.end, chunk.start, chunk.end) : chunk.start;
        const tailStart = next ? clamp(next.start, headEnd, chunk.end) : chunk.end;
        const isActive = active.includes(chunk.index);

        return (
          <li
            key={chunk.index}
            data-chunk-anchor={chunk.index}
            onPointerEnter={() => onActivate([chunk.index])}
            className={`relative overflow-hidden rounded-xl border py-3 pl-5 pr-4 transition-colors ${
              isActive ? 'border-white/25 bg-white/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: highlightColor(chunk.index, 0.9) }}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-semibold text-zinc-100">Chunk {chunk.index + 1}</p>
              <p className="font-mono text-[11px] tabular-nums text-zinc-400">
                {numberFormat.format(chunk.end - chunk.start)} karakter · {numberFormat.format(countWords(chunk.text))}{' '}
                kelime · [{chunk.start}–{chunk.end}]
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words font-mono text-[12.5px] leading-6 text-zinc-300">
              {headEnd > chunk.start && <mark className={overlapMark}>{text.slice(chunk.start, headEnd)}</mark>}
              {text.slice(headEnd, tailStart)}
              {tailStart < chunk.end && <mark className={overlapMark}>{text.slice(tailStart, chunk.end)}</mark>}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
