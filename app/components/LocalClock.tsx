'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react';

function partOfDay(hour: number): { label: string; icon: LucideIcon } {
  if (hour >= 6 && hour < 12) return { label: 'sabah', icon: Sunrise };
  if (hour >= 12 && hour < 18) return { label: 'öğleden sonra', icon: Sun };
  if (hour >= 18 && hour < 22) return { label: 'akşam', icon: Sunset };
  return { label: 'gece', icon: Moon };
}

export function LocalClock({ timeZone, city }: { timeZone: string; city: string }) {
  const [time, setTime] = useState<{ hours: string; minutes: string } | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    });
    const tick = () => {
      const parts = formatter.formatToParts(new Date());
      setTime({
        hours: parts.find((part) => part.type === 'hour')?.value ?? '00',
        minutes: parts.find((part) => part.type === 'minute')?.value ?? '00',
      });
    };
    tick();
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const period = time ? partOfDay(Number(time.hours)) : null;
  const PeriodIcon = period?.icon;

  return (
    <div className={`transition-opacity duration-500 ${time ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-50 sm:text-5xl">
        {time?.hours ?? '00'}
        <span className="blink">:</span>
        {time?.minutes ?? '00'}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
        {PeriodIcon && <PeriodIcon aria-hidden="true" className="size-4 text-sky-300" />}
        {city}&apos;da şu an {period?.label}
      </p>
    </div>
  );
}
