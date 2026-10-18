'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Hakkımda', isActive: (path: string) => path === '/' },
  { href: '/araclar', label: 'Araçlar', isActive: (path: string) => path.startsWith('/araclar') },
  { href: '/analiz', label: 'Analiz', isActive: (path: string) => path.startsWith('/analiz') },
  { href: '/yazilar', label: 'Yazılar', isActive: (path: string) => path.startsWith('/yazilar') },
];

export function NavTabs() {
  const pathname = usePathname();
  const activeIndex = tabs.findIndex((tab) => tab.isActive(pathname));

  return (
    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-full bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}
      {tabs.map((tab, index) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={index === activeIndex ? 'page' : undefined}
          className={`relative rounded-full px-2 py-1.5 text-center text-[13px] font-medium sm:px-4 sm:text-sm transition-colors duration-300 ${
            index === activeIndex ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
