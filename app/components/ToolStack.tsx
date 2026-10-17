import { Sparkles, Wrench, Zap } from 'lucide-react';

// Decorative stack of mini tool cards; fans out when the parent `group` is hovered.
const cards = [
  {
    icon: Zap,
    className:
      '-translate-x-6 translate-y-3 -rotate-12 group-hover:-translate-x-10 group-hover:translate-y-4 group-hover:-rotate-[18deg]',
  },
  {
    icon: Wrench,
    className: 'translate-x-6 translate-y-2 rotate-6 group-hover:translate-x-10 group-hover:rotate-12',
  },
  {
    icon: Sparkles,
    className: '-translate-y-2 -rotate-2 group-hover:-translate-y-5',
  },
];

export function ToolStack({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-32 w-52 ${className}`}>
      {cards.map(({ icon: Icon, className: cardClassName }, index) => (
        <div
          key={index}
          className={`absolute inset-x-8 inset-y-5 rounded-2xl border border-white/10 bg-zinc-900/90 p-3 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${cardClassName}`}
        >
          <span className="grid size-7 place-items-center rounded-lg bg-linear-to-br from-blue-500/30 to-cyan-500/20 text-sky-200">
            <Icon className="size-3.5" />
          </span>
          <span className="mt-3 block h-1.5 w-3/4 rounded-full bg-white/10" />
          <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
