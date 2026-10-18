import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { cardClass } from '../components/Card';
import { SpotlightGrid } from '../components/SpotlightGrid';
import { posts, type Post } from '../data/yazilar';
import { formatDate, loadPost } from './_lib/posts';

export const metadata: Metadata = {
  title: 'Yazılar',
  description: 'Yapay zekâ, LLM’ler ve yazılım üzerine araştırma notları ve yazılar.',
};

async function PostCard({ post, delay }: { post: Post; delay: number }) {
  const { minutes } = await loadPost(post.slug);

  return (
    <Link
      href={`/yazilar/${post.slug}`}
      className={`${cardClass()} group flex flex-col`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {minutes} dk okuma
        </p>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 flex-none text-zinc-500 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-zinc-50">{post.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{post.description}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {post.tags.map((tag) => (
          <li key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default function PostsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <header className="fade-up max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-[#0a1530]/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-100 backdrop-blur-xl">
          <BookOpen aria-hidden="true" className="size-3.5" />
          {posts.length} yazı
        </span>
        <h1 className="mt-5 bg-linear-to-b from-white to-white/70 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl">
          Yazılar
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-white/80">
          İncelediğim araçlar, makaleler ve projeler üzerine araştırma notları.
        </p>
      </header>

      <SpotlightGrid className="mt-10 grid gap-4 lg:grid-cols-2">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} delay={80 + i * 60} />
        ))}
      </SpotlightGrid>
    </main>
  );
}
