'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Info, Languages, LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
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
import { SAMPLE_EN, SAMPLE_TR } from './sampleText';

type Encoder = Pick<typeof import('gpt-tokenizer/encoding/o200k_base'), 'encode' | 'decodeGenerator'>;

const ENCODINGS = [
  { id: 'o200k_base', models: 'GPT-4o, GPT-4.1, o serisi ve yeni OpenAI modelleri' },
  { id: 'cl100k_base', models: 'GPT-4, GPT-3.5 ve text-embedding-3 modelleri' },
] as const;
type EncodingId = (typeof ENCODINGS)[number]['id'];

const MAX_CHARS = 200_000;
const MAX_VISIBLE_TOKENS = 2_000;
const BAR_COLOR = '#3987e5';

const usdFormat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 });
const ratioFormat = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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

export function TokenCounter() {
  const [text, setText] = useState(SAMPLE_TR);
  const [encoding, setEncoding] = useState<EncodingId>('o200k_base');
  const [view, setView] = useState<'text' | 'ids'>('text');
  const [price, setPrice] = useState('1');
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
  const deferredEncoding = useDeferredValue(encoding);
  const isStale = deferredText !== text || deferredEncoding !== encoding;

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
  const tokens = tokensByEncoding?.[deferredEncoding] ?? [];
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
        ? {
            tr: encoders[deferredEncoding].encode(SAMPLE_TR).length,
            en: encoders[deferredEncoding].encode(SAMPLE_EN).length,
          }
        : null,
    [encoders, deferredEncoding],
  );

  const charsPerToken = tokens.length > 0 ? deferredText.length / tokens.length : 0;
  const o200kCount = tokensByEncoding?.o200k_base.length ?? 0;
  const cl100kCount = tokensByEncoding?.cl100k_base.length ?? 0;
  const maxCount = Math.max(o200kCount, cl100kCount, 1);

  const costPerRequest = (tokens.length * parseAmount(price)) / 1_000_000;
  const requestCount = Math.floor(parseAmount(requests));

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

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="fade-up space-y-4 lg:sticky lg:top-24 lg:self-start" style={{ animationDelay: '140ms' }}>
          {/* Tokenizer */}
          <section className={panel}>
            <fieldset>
              <legend className={panelTitle}>Tokenizer</legend>
              <div className="mt-4 space-y-2">
                {ENCODINGS.map((option) => (
                  <label key={option.id} className="relative block">
                    <input
                      type="radio"
                      name="encoding"
                      value={option.id}
                      checked={encoding === option.id}
                      onChange={() => setEncoding(option.id)}
                      className="peer sr-only"
                    />
                    <span className="block cursor-pointer rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 peer-checked:border-sky-400/50 peer-checked:bg-sky-400/[0.08] peer-focus-visible:outline-2 peer-focus-visible:outline-sky-400">
                      <span className="block font-mono text-sm text-zinc-100">{option.id}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-zinc-400">{option.models}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          {/* Maliyet */}
          <section className={panel}>
            <h2 className={panelTitle}>Tahmini maliyet</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
                1M token fiyatı ($)
                <input
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={numberInput}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
                İstek sayısı
                <input
                  inputMode="numeric"
                  value={requests}
                  onChange={(event) => setRequests(event.target.value)}
                  className={numberInput}
                />
              </label>
            </div>
            <dl className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-400">Tek istek</dt>
                <dd className="font-medium text-zinc-100">{usdFormat.format(costPerRequest)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-400">{numberFormat.format(requestCount)} istek</dt>
                <dd className="text-lg font-semibold text-zinc-50">{usdFormat.format(costPerRequest * requestCount)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Yalnızca bu metnin girdi token&apos;ları hesaplanır. Modelinin güncel fiyatını sağlayıcının fiyat
              sayfasından gir.
            </p>
          </section>
        </div>

        {/* Sonuçlar */}
        <div
          className={`fade-up min-w-0 space-y-4 transition-opacity duration-200 ${isStale ? 'opacity-60' : ''}`}
          style={{ animationDelay: '200ms' }}
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
                <Stat label="Token" value={numberFormat.format(tokens.length)} />
                <Stat label="Karakter" value={numberFormat.format(deferredText.length)} />
                <Stat label="Kelime" value={numberFormat.format(countWords(deferredText))} />
                <Stat
                  label="Karakter / token"
                  value={tokens.length > 0 ? ratioFormat.format(charsPerToken) : '–'}
                />
              </dl>

              {/* Karşılaştırma */}
              <section className={panel}>
                <h2 className={panelTitle}>Tokenizer karşılaştırması</h2>
                <div className="mt-4 space-y-3">
                  {ENCODINGS.map((option) => {
                    const count = tokensByEncoding?.[option.id].length ?? 0;
                    return (
                      <div key={option.id}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-mono text-zinc-300">{option.id}</span>
                          <span className="font-medium text-zinc-100">{numberFormat.format(count)} token</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-r-[4px] bg-[#3987e5]/15">
                          <div
                            className="h-full rounded-r-[4px] transition-[width] duration-300"
                            style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: BAR_COLOR }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cl100kCount > o200kCount && o200kCount > 0 && (
                  <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
                    {`Eski cl100k_base, bu metin için yeni o200k_base'e göre ${percentFormat.format(cl100kCount / o200kCount - 1)} daha fazla token kullanıyor.`}
                  </p>
                )}
                {sampleCounts && sampleCounts.tr > sampleCounts.en && (
                  <p className="mt-4 flex gap-2.5 rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4 text-[13px] leading-relaxed text-sky-100/90">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sky-300" />
                    <span>
                      {`Türkçe neden pahalı? Aynı anlamdaki örnek paragraf ${deferredEncoding} ile Türkçede ${sampleCounts.tr}, İngilizcede ${sampleCounts.en} token tutuyor; Türkçe yaklaşık ${percentFormat.format(sampleCounts.tr / sampleCounts.en - 1)} daha fazla token harcıyor. Örnek butonlarıyla ikisini kendin de deneyebilirsin.`}
                    </span>
                  </p>
                )}
              </section>

              {/* Token'lar */}
              <section className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={panelTitle}>Token&apos;lar · {deferredEncoding}</h2>
                  <div role="tablist" aria-label="Görünüm" className="inline-flex rounded-full bg-black/30 p-1 ring-1 ring-white/10">
                    {(
                      [
                        ['text', 'Metin'],
                        ['ids', "Token ID'leri"],
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
                <p className="mt-3 text-xs text-zinc-400">
                  {tokens.length > MAX_VISIBLE_TOKENS
                    ? `Her renk bir token. Uzun metinlerde ilk ${numberFormat.format(MAX_VISIBLE_TOKENS)} token gösteriliyor.`
                    : 'Her renk bir token; üzerine gelince token ID’si görünür.'}
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
    </div>
  );
}
