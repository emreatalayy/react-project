import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { cardClass } from '../components/Card';
import { SpotlightGrid } from '../components/SpotlightGrid';
import { analyses } from '../data/analiz';
import { display } from './_lib/fonts';
import { goalsOf } from './_lib/replay';
import type { MatchStory } from './_lib/story';

export const metadata: Metadata = {
  title: 'Maç Analizleri',
  description: 'Maçları veriyle yeniden oynatan kısa analizler: kazanma olasılığı, kırılma anları ve "ya olsaydı" senaryoları.',
};

function AnalysisCard({ story, delay }: { story: MatchStory; delay: number }) {
  const { home, away } = story.data.teams;
  const goals = goalsOf(story.data);
  const h = goals.filter((g) => g.team === 'home').length;

  return (
    <Link
      href={`/analiz/${story.slug}`}
      className={`${cardClass()} group grid content-start gap-5`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
          {story.competition} · {story.date}
        </p>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 flex-none text-zinc-500 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <div className={`${display.className} flex flex-wrap items-center gap-x-3 gap-y-1 text-3xl font-extrabold uppercase text-white`}>
        <span className="inline-flex items-center gap-2">
          <span className="h-[0.8em] w-1.5 rounded-sm" style={{ background: home.color }} />
          {home.name}
        </span>
        <span className="rounded-lg bg-white/[0.08] px-2 tabular-nums ring-1 ring-white/15">
          {h}–{goals.length - h}
        </span>
        <span className="inline-flex items-center gap-2">
          {away.name}
          <span className="h-[0.8em] w-1.5 rounded-sm" style={{ background: away.color }} />
        </span>
      </div>
      <div>
        <h2 className="text-lg font-medium text-zinc-100">{story.headline}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{story.summary}</p>
      </div>
    </Link>
  );
}

export default function AnalysesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <header className="fade-up max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-[#0a1530]/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-100 backdrop-blur-xl">
          <Trophy aria-hidden="true" className="size-3.5" />
          {analyses.length} analiz
        </span>
        <h1 className="mt-5 bg-linear-to-b from-white to-white/70 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl">
          Maç Analizleri
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-white/80">
          Maçları veriyle yeniden oynatıyorum: kim ne zaman favoriydi, kırılma anları ve &quot;ya olsaydı&quot; senaryoları.
        </p>
      </header>

      <SpotlightGrid className="mt-10 grid gap-4 lg:grid-cols-2">
        {analyses.map((story, i) => (
          <AnalysisCard key={story.slug} story={story} delay={80 + i * 60} />
        ))}
      </SpotlightGrid>
    </main>
  );
}
