import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPost, posts } from '../../data/yazilar';
import { formatDate, loadPost } from '../_lib/posts';
import styles from '../_lib/prose.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const { html, minutes } = await loadPost(post.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <Link
        href="/yazilar"
        className="fade-up mb-8 inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Yazılar
      </Link>

      <header className="fade-up border-b border-white/10 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {minutes} dk okuma
        </p>
        <h1 className="mt-4 bg-linear-to-b from-white to-white/75 bg-clip-text text-3xl font-semibold leading-tight tracking-tight text-transparent sm:text-[2.6rem]">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-white/75">{post.description}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <article
        className={`${styles.prose} fade-up mt-10`}
        style={{ animationDelay: '80ms' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
