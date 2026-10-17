'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Hakkımda', isActive: (path: string) => path === '/' },
  { href: '/araclar', label: 'Araçlar', isActive: (path: string) => path.startsWith('/araclar') },
];

export function NavTabs() {
  const pathname = usePathname();
  const activeIndex = tabs.findIndex((tab) => tab.isActive(pathname));

  return (
    <div className="relative grid grid-cols-2">
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}
      {tabs.map((tab, index) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={index === activeIndex ? 'page' : undefined}
          className={`relative rounded-full px-4 py-1.5 text-center text-sm font-medium transition-colors duration-300 ${
            index === activeIndex ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
