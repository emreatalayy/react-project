import type { Metadata } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EnglishCourse } from './EnglishCourse';
import styles from './ingilizce.module.css';

// Rounded, friendly faces for a children's page; both cover Turkish letters
const nunito = Nunito({ subsets: ['latin', 'latin-ext'], variable: '--font-kid' });
const baloo = Baloo_2({ subsets: ['latin', 'latin-ext'], variable: '--font-kid-display' });

export const metadata: Metadata = {
  title: 'Fındık ile İngilizce',
  description:
    'Çocuklar için oyun gibi İngilizce: Fındık’la kelime eşleştir, cümle kur, dinle ve konuş; yıldız ve çıkartma topla.',
};

// Soft clouds over the sky; positions in percent of the viewport
const CLOUDS = [
  { top: '14%', left: '4%', width: '9rem', height: '2.6rem' },
  { top: '32%', left: '78%', width: '12rem', height: '3.2rem' },
  { top: '58%', left: '10%', width: '7rem', height: '2.2rem' },
  { top: '76%', left: '70%', width: '10rem', height: '2.8rem' },
];

export default function EnglishPage() {
  return (
    <div className={`${nunito.variable} ${baloo.variable} ${styles.kid}`}>
      <div aria-hidden="true" className={`${styles.sky} pointer-events-none fixed inset-0 -z-10 overflow-hidden`}>
        {CLOUDS.map((cloud) => (
          <span key={cloud.top} className={`${styles.cloud} ${styles.drift}`} style={cloud} />
        ))}
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-xl">
          <Link
            href="/araclar"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-white hover:text-slate-800"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Araçlar
          </Link>
          <h1 className={`${styles.display} mt-4 text-4xl font-bold text-slate-800 sm:text-5xl`}>
            Fındık ile İngilizce
          </h1>
        </div>
        <EnglishCourse />
      </main>
    </div>
  );
}
