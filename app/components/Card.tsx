import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// Frosted dark glass over the wallpaper: a tinted base keeps text legible, the blur keeps it calm
const tones = {
  default: 'border-white/[0.12] bg-[#0a1530]/65 bg-linear-to-b from-white/[0.07] to-white/[0.02]',
  accent:
    'border-sky-300/25 bg-[#0a1530]/65 bg-linear-to-br from-blue-500/[0.2] via-sky-500/[0.08] to-cyan-500/[0.06]',
  linkedin: 'border-sky-300/25 bg-[#0a1530]/65 bg-linear-to-br from-[#0a66c2]/35 via-[#0a66c2]/12 to-white/[0.02]',
};

type Tone = keyof typeof tones;

export const glassShadow =
  'shadow-[0_16px_40px_-20px_rgba(3,12,32,0.7),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl';

export function cardClass(tone: Tone = 'default') {
  return `spotlight fade-up rounded-3xl border p-5 sm:p-6 ${glassShadow} ${tones[tone]}`;
}

export function Card({
  children,
  className = '',
  delay = 0,
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  tone?: Tone;
}) {
  return (
    <div className={`${cardClass(tone)} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function CardLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
      <Icon aria-hidden="true" className="size-3.5" />
      {children}
    </p>
  );
}
