'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { CircleAlert, Info, Languages, LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
import {
  countWords,
  highlightColor,
  numberFormat,
  numberInput,
  panel,
  panelTitle,
  percentFormat,
  smallButton,
  Stat,
} from '../shared';
import { estimateCost, MODELS, PRICES_CHECKED, type ModelInfo } from './models';
import { SAMPLE_EN, SAMPLE_TR } from './sampleText';

type Encoder = Pick<typeof import('gpt-tokenizer/encoding/o200k_base'), 'encode' | 'decodeGenerator'>;
type EncodingId = ModelInfo['encoding'];

const ENCODING_OPTIONS: { id: EncodingId; label: string }[] = [
  { id: 'o200k_base', label: 'o200k_base · sohbet' },
  { id: 'cl100k_base', label: 'cl100k_base · embedding' },
];

const MAX_CHARS = 200_000;
const MAX_VISIBLE_TOKENS = 2_000;
const BAR_COLOR = '#3987e5';
// Status "critical" from the chart palette; always paired with an icon and a label
const CRITICAL_COLOR = '#d03b3b';

const ratioFormat = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const shareFormat = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 2 });
const priceFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 3 });
const usdFormats = new Map<number, Intl.NumberFormat>();

type Piece = { text: string; tokens: number[] };

// decodeGenerator pulls tokens lazily and only yields once the bytes form whole characters, so
// counting what it has consumed maps every yielded piece back to the tokens it came from.
function splitIntoPieces(encoder: Encoder, tokens: number[]): Piece[] {
  let consumed = 0;
  const source = {
    *[Symbol.iterator]() {
      for (const token of tokens) {
        consumed++;
        yield token;
      }
    },
  };
  const pieces: Piece[] = [];
  let start = 0;
  for (const text of encoder.decodeGenerator(source)) {
    pieces.push({ text, tokens: tokens.slice(start, consumed) });
    start = consumed;
  }
  return pieces;
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

// Small amounts keep their significant digits: $0,000105 rather than $0,00
function formatUsd(value: number) {
  const digits = value === 0 || value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  let format = usdFormats.get(digits);
  if (!format) {
    format = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    });
    usdFormats.set(digits, format);
  }
  return format.format(value);
}

function formatLimit(tokens: number) {
  if (tokens >= 1_000_000) return `${numberFormat.format(Math.round(tokens / 10_000) / 100)}M`;
  if (tokens >= 100_000) return `${numberFormat.format(Math.round(tokens / 1000))}K`;
  return numberFormat.format(tokens);
}

function priceLine(model: ModelInfo) {
  const { input, output } = model.price;
  const base =
    output === null
      ? `Girdi $${priceFormat.format(input)} · çıktı yok`
      : `Girdi $${priceFormat.format(input)} · Çıktı $${priceFormat.format(output)}`;
  if (!model.longContext) return base;
  const { threshold, input: longInput, output: longOutput } = model.longContext;
  return `${base} · ${formatLimit(threshold)} üstü $${priceFormat.format(longInput)} / $${priceFormat.format(longOutput ?? 0)}`;
}

export function TokenCounter() {
  const [text, setText] = useState(SAMPLE_TR);
  const [viewEncoding, setViewEncoding] = useState<EncodingId>('o200k_base');
  const [view, setView] = useState<'text' | 'ids'>('text');
  const [outputTokens, setOutputTokens] = useState('500');
  const [requests, setRequests] = useState('1000');
  const [encoders, setEncoders] = useState<Record<EncodingId, Encoder> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // The vocabularies are a few MB, so they load on demand rather than with the page
  useEffect(() => {
    let cancelled = false;
    Promise.all([import('gpt-tokenizer/encoding/o200k_base'), import('gpt-tokenizer/encoding/cl100k_base')])
      .then(([o200k, cl100k]) => {
        if (!cancelled) setEncoders({ o200k_base: o200k, cl100k_base: cl100k });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const deferredText = useDeferredValue(text);
  const deferredEncoding = useDeferredValue(viewEncoding);
  const isStale = deferredText !== text || deferredEncoding !== viewEncoding;

  const tokensByEncoding = useMemo(
    () =>
      encoders
        ? {
            o200k_base: encoders.o200k_base.encode(deferredText),
            cl100k_base: encoders.cl100k_base.encode(deferredText),
          }
        : null,
    [encoders, deferredText],
  );
  const pieces = useMemo(
    () =>
      encoders && tokensByEncoding
        ? splitIntoPieces(encoders[deferredEncoding], tokensByEncoding[deferredEncoding].slice(0, MAX_VISIBLE_TOKENS))
        : [],
    [encoders, tokensByEncoding, deferredEncoding],
  );

  // The bundled paragraph exists in both languages, so the Turkish overhead is measured, not estimated
  const sampleCounts = useMemo(
    () =>
      encoders
        ? { tr: encoders.o200k_base.encode(SAMPLE_TR).length, en: encoders.o200k_base.encode(SAMPLE_EN).length }
        : null,
    [encoders],
  );

  const chatTokens = tokensByEncoding?.o200k_base.length ?? 0;
  const viewTokens = tokensByEncoding?.[deferredEncoding].length ?? 0;
  const charsPerToken = chatTokens > 0 ? deferredText.length / chatTokens : 0;
  const expectedOutput = Math.floor(parseAmount(outputTokens));
  const requestCount = Math.max(1, Math.floor(parseAmount(requests)));

  const rows = MODELS.map((model) => {
    const tokens = tokensByEncoding?.[model.encoding].length ?? 0;
    const cost = estimateCost(model, tokens, model.kind === 'chat' ? expectedOutput : 0, requestCount);
    return { model, tokens, cost };
  });

  // Cheapest chat model that can actually take this prompt
  let cheapestId: string | null = null;
  let cheapestCost = Infinity;
  for (const row of rows) {
    if (row.model.kind !== 'chat' || row.tokens > row.model.inputLimit || row.cost >= cheapestCost) continue;
    cheapestCost = row.cost;
    cheapestId = row.model.id;
  }

  function updateText(value: string) {
    if (value.length > MAX_CHARS) {
      setNotice(`Metin çok uzun; ilk ${numberFormat.format(MAX_CHARS)} karakter kullanılıyor.`);
      setText(value.slice(0, MAX_CHARS));
      return;
    }
    setNotice(null);
    setText(value);
  }

  return (
    <div className="mt-10 space-y-4">
      {/* Metin */}
      <section className={`${panel} fade-up`} style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={panelTitle}>
            <label htmlFor="token-text">Metin</label>
          </h2>
          <p className="text-xs text-zinc-400">
            {numberFormat.format(text.length)} karakter · {numberFormat.format(countWords(text))} kelime
          </p>
        </div>
        <textarea
          id="token-text"
          value={text}
          onChange={(event) => updateText(event.target.value)}
          spellCheck={false}
          placeholder="Token sayısını görmek istediğin metni buraya yapıştır…"
          className="mt-3 h-36 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-zinc-200 placeholder:text-zinc-400 focus:border-sky-400/50 focus:outline-none sm:h-44"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => updateText(SAMPLE_TR)} className={smallButton}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Türkçe örnek
          </button>
          <button type="button" onClick={() => updateText(SAMPLE_EN)} className={smallButton}>
            <Languages aria-hidden="true" className="size-4" />
            Aynı metin İngilizce
          </button>
          <button type="button" onClick={() => updateText('')} className={smallButton}>
            <Trash2 aria-hidden="true" className="size-4" />
            Temizle
          </button>
        </div>
        {notice && (
          <p role="status" className="mt-3 text-xs text-amber-300">
            {notice}
          </p>
        )}
      </section>

      <div
        className={`fade-up space-y-4 transition-opacity duration-200 ${isStale ? 'opacity-60' : ''}`}
        style={{ animationDelay: '140ms' }}
      >
        {!encoders ? (
          <div className={`${panel} flex flex-col items-center py-16 text-center`}>
            {loadFailed ? (
              <>
                <p className="font-medium text-zinc-100">Tokenizer yüklenemedi</p>
                <p className="mt-1.5 text-sm text-zinc-400">Bağlantını kontrol edip sayfayı yenilemeyi dene.</p>
              </>
            ) : (
              <>
                <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-sky-300" />
                <p className="mt-4 text-sm text-zinc-400">Tokenizer yükleniyor…</p>
              </>
            )}
          </div>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Token · GPT (o200k)" value={numberFormat.format(chatTokens)} />
              <Stat label="Karakter" value={numberFormat.format(deferredText.length)} />
              <Stat label="Kelime" value={numberFormat.format(countWords(deferredText))} />
              <Stat label="Karakter / token" value={chatTokens > 0 ? ratioFormat.format(charsPerToken) : '–'} />
            </dl>

            {/* Modeller */}
            <section className={panel}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className={panelTitle}>Modellere göre token ve maliyet</h2>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    OpenAI · resmi tokenizer&apos;larla birebir · standart kademe, 1M token başına fiyatlar ·{' '}
                    {PRICES_CHECKED} itibarıyla
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    Beklenen çıktı
                    <input
                      inputMode="numeric"
                      value={outputTokens}
                      onChange={(event) => setOutputTokens(event.target.value)}
                      className={numberInput}
                    />
                    token
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    İstek sayısı
                    <input
                      inputMode="numeric"
                      value={requests}
                      onChange={(event) => setRequests(event.target.value)}
                      className={numberInput}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_8rem] gap-x-4 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 sm:grid">
                <span>Model</span>
                <span>Token · bağlam penceresi</span>
                <span className="text-right">{numberFormat.format(requestCount)} istek</span>
              </div>

              <ul className="mt-2 sm:mt-0">
                {rows.map((row) => (
                  <ModelRow key={row.model.id} {...row} requests={requestCount} cheapest={row.model.id === cheapestId} />
                ))}
              </ul>

              <p className="mt-5 border-t border-white/[0.06] pt-4 text-[11px] leading-relaxed text-zinc-400">
                Maliyet = (girdi token × girdi fiyatı + beklenen çıktı × çıktı fiyatı) × istek sayısı. Girdi eşiği
                aşan isteklerde uzun bağlam fiyatı uygulanır; önbellek ve batch indirimleri hesaba katılmaz.
              </p>
            </section>

            {sampleCounts && sampleCounts.tr > sampleCounts.en && (
              <p className="flex gap-2.5 rounded-2xl border border-sky-400/20 bg-[#0a1530]/60 p-4 text-[13px] leading-relaxed text-sky-100/90 backdrop-blur-xl">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sky-300" />
                <span>
                  {`Türkçe neden pahalı? Aynı anlamdaki örnek paragraf o200k_base ile Türkçede ${sampleCounts.tr}, İngilizcede ${sampleCounts.en} token tutuyor; Türkçe yaklaşık ${percentFormat.format(sampleCounts.tr / sampleCounts.en - 1)} daha fazla token harcıyor. Örnek butonlarıyla ikisini kendin de deneyebilirsin.`}
                </span>
              </p>
            )}

            {/* Token'lar */}
            <section className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className={panelTitle}>Token&apos;lar</h2>
                <div className="flex flex-wrap gap-2">
                  <div role="radiogroup" aria-label="Tokenizer" className="inline-flex rounded-full bg-black/30 p-1 ring-1 ring-white/10">
                    {ENCODING_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={viewEncoding === option.id}
                        onClick={() => setViewEncoding(option.id)}
                        className={`rounded-full px-3 py-1.5 font-mono text-[12px] transition-colors ${
                          viewEncoding === option.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div role="tablist" aria-label="Görünüm" className="inline-flex rounded-full bg-black/30 p-1 ring-1 ring-white/10">
                    {(
                      [
                        ['text', 'Metin'],
                        ['ids', "ID'ler"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={view === value}
                        aria-controls="token-view"
                        onClick={() => setView(value)}
                        className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                          view === value ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                {viewTokens > MAX_VISIBLE_TOKENS
                  ? `Her renk bir token. Uzun metinlerde ilk ${numberFormat.format(MAX_VISIBLE_TOKENS)} token gösteriliyor.`
                  : "Her renk bir token; üzerine gelince ID'si görünür."}
              </p>
              <div
                id="token-view"
                role="tabpanel"
                className="mt-4 max-h-[28rem] overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/30 p-3 sm:max-h-[32rem] sm:p-5"
              >
                {pieces.length === 0 ? (
                  <p className="text-sm text-zinc-400">Token görmek için yukarıya bir metin yaz.</p>
                ) : view === 'text' ? (
                  <p className="whitespace-pre-wrap break-words font-mono text-[13px] leading-7 text-zinc-100">
                    {pieces.map((piece, index) => (
                      <span
                        key={index}
                        title={`Token ID: ${piece.tokens.join(', ')}`}
                        className="mr-px rounded-[3px] [box-decoration-break:clone]"
                        style={{ backgroundColor: highlightColor(index, 0.32) }}
                      >
                        {piece.text}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="flex flex-wrap gap-1 font-mono text-[12px] tabular-nums text-zinc-100">
                    {pieces.flatMap((piece, index) =>
                      piece.tokens.map((token, offset) => (
                        <span
                          key={`${index}-${offset}`}
                          title={JSON.stringify(piece.text)}
                          className="rounded-[4px] px-1.5 py-0.5"
                          style={{ backgroundColor: highlightColor(index, 0.32) }}
                        >
                          {token}
                        </span>
                      )),
                    )}
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ModelRow({
  model,
  tokens,
  cost,
  requests,
  cheapest,
}: {
  model: ModelInfo;
  tokens: number;
  cost: number;
  requests: number;
  cheapest: boolean;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-t border-white/[0.06] py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_8rem]">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-100">
          {model.name}
          {model.kind === 'embedding' && (
            <span
              lang="en"
              className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300"
            >
              embedding
            </span>
          )}
          {cheapest && (
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              en ucuz
            </span>
          )}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{priceLine(model)}</p>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <ContextMeter tokens={tokens} limit={model.inputLimit} />
      </div>
      <div className="col-start-2 row-start-1 text-right sm:col-start-auto sm:row-start-auto">
        <p className="text-sm font-semibold text-zinc-50">{formatUsd(cost)}</p>
        {requests > 1 && <p className="text-[11px] text-zinc-400">istek başı {formatUsd(cost / requests)}</p>}
      </div>
    </li>
  );
}

function ContextMeter({ tokens, limit }: { tokens: number; limit: number }) {
  const ratio = tokens / limit;
  const overflow = ratio > 1;
  const share = ratio > 0 && ratio < 0.0001 ? '<%0,01' : shareFormat.format(ratio);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-mono tabular-nums text-zinc-100">{numberFormat.format(tokens)} token</span>
        {overflow ? (
          <span className="inline-flex items-center gap-1 text-red-300">
            <CircleAlert aria-hidden="true" className="size-3.5" />
            Sığmıyor · {formatLimit(limit)} sınır
          </span>
        ) : (
          <span className="text-zinc-400">
            {share} · {formatLimit(limit)}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 rounded-r-[4px] bg-[#3987e5]/15">
        <div
          className="h-full rounded-r-[4px]"
          style={{
            width: `${Math.min(ratio, 1) * 100}%`,
            minWidth: tokens > 0 ? 2 : 0,
            backgroundColor: overflow ? CRITICAL_COLOR : BAR_COLOR,
          }}
        />
      </div>
    </div>
  );
}
