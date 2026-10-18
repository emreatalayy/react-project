import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { glassShadow } from '../../components/Card';
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
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <Link
        href="/yazilar"
        className="fade-up mb-6 inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Yazılar
      </Link>

      {/* A solid reading surface: long text straight on the bright wallpaper is hard on the eyes */}
      <article
        className={`fade-up rounded-[2rem] border border-white/[0.12] bg-[#081330]/80 px-5 py-8 sm:px-12 sm:py-12 ${glassShadow}`}
      >
        <header>
          <p className="text-sm text-white/55">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {minutes} dakikalık okuma
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">{post.title}</h1>
        </header>

        <div className={`${styles.prose} mt-8`} dangerouslySetInnerHTML={{ __html: html }} />

        <footer className="mt-12 grid gap-5 border-t border-white/10 pt-6 text-sm">
          <div>
            <p className="text-white/55">Kaynaklar</p>
            <ul className="mt-2 grid gap-1.5">
              {post.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-sky-300 transition-colors hover:text-sky-200"
                  >
                    {source.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
                {tag}
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </main>
  );
}
