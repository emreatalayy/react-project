import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { glassShadow } from '../../components/Card';
import { analyses, getAnalysis } from '../../data/analiz';
import { KeyNumbers } from '../_components/KeyNumbers';
import { ReplayCards } from '../_components/ReplayCards';
import { Scoreboard } from '../_components/Scoreboard';
import { Simulator } from '../_components/Simulator';
import { WinProbabilityChart } from '../_components/WinProbabilityChart';
import { storyApi } from '../_lib/api';
import { DRAW_COLOR } from '../_lib/format';
import { display } from '../_lib/fonts';
import { goalsOf, winProbability } from '../_lib/replay';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return analyses.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = getAnalysis((await params).slug);
  if (!story) return {};
  const { home, away } = story.data.teams;
  const goals = goalsOf(story.data);
  const h = goals.filter((g) => g.team === 'home').length;
  return {
    title: `${home.name} ${h}–${goals.length - h} ${away.name}`,
    description: story.summary,
  };
}

const eyebrow = 'font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400';
const heading = 'text-2xl font-semibold tracking-tight text-white sm:text-3xl';
const lede = 'max-w-2xl leading-relaxed text-white/75';

function SectionHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-2.5">
      <p className={eyebrow}>{kicker}</p>
      <h2 className={heading}>{title}</h2>
      {children && <p className={lede}>{children}</p>}
    </div>
  );
}

type LegendItem = { label: string; color: string; kind?: 'square' | 'line' | 'dashed' | 'band' };

function LegendKey({ color, kind = 'square' }: Omit<LegendItem, 'label'>) {
  if (kind === 'line') return <span className="h-[3px] w-5 rounded-full" style={{ background: color }} />;
  if (kind === 'dashed')
    return <span className="h-0 w-5 border-t-2 border-dashed opacity-80" style={{ borderColor: color }} />;
  if (kind === 'band') return <span className="h-3 w-4 rounded-[3px] opacity-25" style={{ background: color }} />;
  return <span className="size-2.5 rounded-[3px]" style={{ background: color }} />;
}

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-white/75">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-2">
          <LegendKey color={item.color} kind={item.kind} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export default async function MatchAnalysisPage({ params }: Props) {
  const story = getAnalysis((await params).slug);
  if (!story) notFound();

  const api = storyApi(story);
  const { data } = story;
  const { home, away } = data.teams;
  const outcomeLegend = [
    { label: `${home.name} kazanır`, color: home.color },
    { label: 'Beraberlik', color: DRAW_COLOR },
    { label: `${away.name} kazanır`, color: away.color },
  ];
  const wp = story.winProbability;
  const cf = wp.counterfactual;
  const cfStart = cf ? (data.disallowed[0]?.el ?? 0) : 0;
  const chartLegend: LegendItem[] = [
    { label: `${home.name} kazanır`, color: home.color, kind: 'line' },
    { label: `${away.name} kazanır`, color: away.color, kind: 'line' },
    ...(cf ? [{ label: cf.legend, color: 'rgba(255,255,255,0.75)', kind: 'dashed' as const }] : []),
    ...(wp.highlight ? [{ label: wp.highlight.label, color: home.color, kind: 'band' as const }] : []),
  ];

  return (
    <main className={`${display.variable} mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12`}>
      <Link
        href="/analiz"
        className="fade-up mb-6 inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Maç analizleri
      </Link>

      <Scoreboard data={data} competition={story.competition} date={story.date} />

      <p className="fade-up mx-auto mt-9 max-w-2xl text-center text-lg leading-relaxed text-white/85 sm:text-xl max-sm:text-left">
        {story.deck[0]}
        <mark className="rounded bg-orange-400/20 px-1 text-white [box-decoration-break:clone]">{story.deck[1]}</mark>
        {story.deck[2]}
      </p>

      <KeyNumbers numbers={story.numbers(api)} data={data} />

      <section className="mt-16 grid gap-5">
        <SectionHead kicker="Dakika dakika" title={wp.title}>
          {wp.lede}
        </SectionHead>
        <div className={`fade-up grid gap-5 rounded-3xl border border-white/[0.12] bg-[#0a1530]/65 p-4 sm:p-6 ${glassShadow}`}>
          <Legend items={chartLegend} />
          <WinProbabilityChart
            series={winProbability(data, story.whatifs)}
            counterfactual={
              cf
                ? {
                    label: cf.tooltip,
                    points: winProbability(data, story.whatifs, { [cf.id]: true }, cfStart).filter((p) => p.m <= (cf.until ?? data.end)),
                  }
                : undefined
            }
            goals={goalsOf(data).map((g) => ({ el: g.el, side: g.team }))}
            annotations={wp.annotations(api)}
            highlight={wp.highlight}
            end={data.end}
            firstHalfAdded={data.firstHalfAdded}
            colors={[home.color, away.color]}
            names={[home.name, away.name]}
            shorts={[home.short, away.short]}
          />
        </div>
        <p className={lede}>{wp.text(api)}</p>
      </section>

      <section className="mt-16 grid gap-5">
        <SectionHead kicker="Kırılma anları" title={story.replay.title}>
          {story.replay.lede}
        </SectionHead>
        <Legend items={outcomeLegend} />
        <ReplayCards cards={story.replay.cards} api={api} />
      </section>

      <section className="mt-16 grid gap-5">
        <SectionHead kicker="Sıra sende" title={story.simulator.title} />
        <Simulator data={data} whatifs={story.whatifs} presets={story.simulator.presets} />
      </section>

      <details className={`group mt-14 rounded-3xl border border-white/[0.12] bg-[#0a1530]/65 px-5 py-4 text-sm leading-relaxed text-white/75 ${glassShadow}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-white [&::-webkit-details-marker]:hidden">
          Bu sayılar nasıl hesaplandı?
          <span aria-hidden="true" className="text-xl leading-none text-white/50 group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden text-xl leading-none text-white/50 group-open:inline">
            –
          </span>
        </summary>
        <ul className="mt-3 grid max-w-3xl list-disc gap-1.5 pl-5">
          <li>Maç verisi ESPN&apos;in dakika dakika anlatımından alındı: {data.shots.length} şut, dakikası, bölgesi ve nasıl geldiği.</li>
          <li>
            Her şutun gol olma ihtimalini (xG) StatsBomb&apos;un açık verisindeki {data.model.nShots.toLocaleString('tr-TR')} şutla
            eğitilen bir modelle hesapladık.
          </li>
          <li>Yeniden oynatmada her şut, kendi ihtimaliyle gol oluyor ya da olmuyor. Sonuçlar tam olarak hesaplandı ve 100 maça yuvarlandı.</li>
          <li>
            Dakika dakika grafik geleceği bilmiyor: maç öncesi beklentiden başlıyor ve her dakika o ana kadarki skor ve pozisyonlarla
            güncelleniyor. Maç öncesi beklenti piyasa olasılıklarından marjı temizlenerek çıkarıldı; sayfada oran ya da bahis şirketi yer
            almıyor.
          </li>
          <li>
            Sınır: Skor değişince takımların oyunu da değişir. Bu sayılar kesin cevap değil, ihtimallerin büyüklüğünü gösteriyor.
          </li>
          <li>
            Kaynaklar:{' '}
            <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:text-white">
              ESPN
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/statsbomb/open-data"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              StatsBomb Open Data
            </a>
          </li>
        </ul>
      </details>
    </main>
  );
}
