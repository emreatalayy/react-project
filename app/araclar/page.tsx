import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Plus, Sparkles, Wrench } from 'lucide-react';
import { cardClass } from '../components/Card';
import { SpotlightGrid } from '../components/SpotlightGrid';
import { ToolStack } from '../components/ToolStack';
import { isExternalTool, toolHref, tools, type Tool } from '../data/tools';

export const metadata: Metadata = {
  title: 'Araçlar',
  description: 'Yunus Emre Atalay’ın geliştirdiği küçük araçlar.',
};

function ToolCard({ tool, delay }: { tool: Tool; delay: number }) {
  const Icon = tool.icon ?? Sparkles;
  const className = `${cardClass()} group flex min-h-52 flex-col`;
  const style = { animationDelay: `${delay}ms` };

  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-linear-to-br from-blue-500/20 to-cyan-500/10 text-sky-200">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 text-zinc-500 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <h2 className="mt-6 text-lg font-medium text-zinc-100">{tool.name}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{tool.description}</p>
      {tool.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {tool.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return isExternalTool(tool) ? (
    <a href={toolHref(tool)} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {content}
    </a>
  ) : (
    <Link href={toolHref(tool)} className={className} style={style}>
      {content}
    </Link>
  );
}

function GhostCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`fade-up min-h-52 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/25 bg-[#0a1530]/30 text-center backdrop-blur-sm ${className}`}
    >
      <span className="grid size-10 place-items-center rounded-full border border-dashed border-white/30">
        <Plus aria-hidden="true" className="size-4 text-white/60" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">Yakında</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className={`${cardClass()} group col-span-full flex flex-col items-center overflow-hidden py-14 text-center sm:py-16`}
      style={{ animationDelay: '80ms' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[30rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-3xl"
      />
      <ToolStack />
      <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-100">İlk araçlar yolda</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
        Şu an hazırlanıyorlar; yayına girdikçe burada listelenecekler.
      </p>
    </div>
  );
}

export default function ToolsPage() {
  // Placeholders complete the last row: two columns on small screens, three on large ones
  const smGhosts = (2 - (tools.length % 2)) % 2;
  const lgGhosts = (3 - (tools.length % 3)) % 3;
  const ghostCount = tools.length === 0 ? 0 : Math.max(smGhosts, lgGhosts);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <header className="fade-up max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0a1530]/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-100 backdrop-blur-xl">
          <Wrench aria-hidden="true" className="size-3.5" />
          {tools.length > 0 ? `${tools.length} araç` : 'Yakında'}
        </span>
        <h1 className="mt-5 bg-linear-to-b from-white to-white/70 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl">
          Araçlar
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-white/75">
          Kendi geliştirdiğim küçük araçlar. Yenileri eklendikçe burada olacak.
        </p>
      </header>

      <SpotlightGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard key={tool.slug} tool={tool} delay={80 + index * 60} />
        ))}
        {Array.from({ length: ghostCount }, (_, index) => (
          <GhostCard
            key={index}
            className={`${index < smGhosts ? 'flex' : 'hidden'} ${index < lgGhosts ? 'lg:flex' : 'lg:hidden'}`}
          />
        ))}
        {tools.length === 0 && <EmptyState />}
      </SpotlightGrid>
    </main>
  );
}
