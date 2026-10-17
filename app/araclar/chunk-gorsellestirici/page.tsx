import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scissors, ShieldCheck } from 'lucide-react';
import { ChunkVisualizer } from './ChunkVisualizer';

export const metadata: Metadata = {
  title: 'RAG Chunk Görselleştirici',
  description:
    "Metni farklı stratejilerle chunk'lara ayır; sınırları, boyutları ve overlap'leri tarayıcında renkli olarak gör.",
};

export default function ChunkVisualizerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <Link
        href="/araclar"
        className="fade-up inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Araçlar
      </Link>

      <header
        className="fade-up mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        style={{ animationDelay: '40ms' }}
      >
        <div className="max-w-2xl">
          <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-linear-to-br from-blue-500/25 to-cyan-500/10 text-sky-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <Scissors aria-hidden="true" className="size-5" />
          </span>
          <h1 className="mt-5 bg-linear-to-b from-white to-white/70 bg-clip-text text-3xl font-semibold leading-tight tracking-tight text-transparent sm:text-4xl">
            RAG Chunk Görselleştirici
          </h1>
          <p className="mt-3 leading-relaxed text-white/75">
            Metnini farklı bölme stratejileriyle chunk&apos;lara ayır; sınırları, boyutları ve overlap&apos;leri renkli
            olarak gör.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-[#0a1530]/50 px-3.5 py-1.5 text-xs text-emerald-200 backdrop-blur-xl">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Tarayıcında çalışır, metnin hiçbir yere gönderilmez
        </p>
      </header>

      <ChunkVisualizer />
    </main>
  );
}
