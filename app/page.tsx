import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from './components/BrandIcons';
import { Card, CardLabel, cardClass, glassShadow } from './components/Card';
import { CopyEmailButton } from './components/CopyEmailButton';
import { LocalClock } from './components/LocalClock';
import { RouteArc } from './components/RouteArc';
import { SpotlightGrid } from './components/SpotlightGrid';
import { ToolStack } from './components/ToolStack';
import { cvData } from './data/cv';
import { tools } from './data/tools';

const iconButton =
  'grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white';

const linkCard = 'group flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1';

// Brand colors that would vanish on the dark background fall back to light gray.
function readableBrandColor(hex: string) {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance < 0.1 ? '#d4d4d8' : `#${hex}`;
}

export default function Home() {
  const { current, location, education, social } = cvData;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <SpotlightGrid className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Profil */}
        <Card className="col-span-2 flex flex-col overflow-hidden sm:p-8 lg:row-span-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-blue-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 -left-20 size-72 rounded-full bg-cyan-500/10 blur-3xl"
          />

          <div className="relative">
            <CardLabel icon={UserRound}>Hakkımda</CardLabel>
            <h1 className="mt-6 bg-linear-to-br from-white via-white to-zinc-400 bg-clip-text text-[1.85rem] font-semibold leading-tight tracking-tight text-transparent sm:mt-10 sm:text-5xl">
              {cvData.name}
            </h1>
            <p className="mt-1 w-fit bg-linear-to-r from-sky-300 via-cyan-300 to-teal-200 bg-clip-text text-base font-medium text-transparent sm:mt-2 sm:text-lg">
              {cvData.title}
            </p>
          </div>
          <p className="relative mt-4 max-w-md text-[14.5px] leading-relaxed text-zinc-400 sm:mt-5 sm:text-[15px]">
            {cvData.bio}
          </p>

          <div className="relative mt-6 flex flex-wrap items-center gap-2 sm:mt-8 lg:mt-auto lg:pt-8">
            <a
              href={`mailto:${cvData.email}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-zinc-950 shadow-[0_0_36px_-8px_rgba(56,189,248,0.75)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Mail aria-hidden="true" className="size-4" />
              <span className="sm:hidden">E-posta gönder</span>
              <span className="hidden sm:inline">{cvData.email}</span>
            </a>
            <CopyEmailButton email={cvData.email} className={iconButton} />
          </div>
        </Card>

        {/* Şu an */}
        <Card className="col-span-2 flex flex-col md:col-span-1" delay={60}>
          <div className="flex items-start justify-between">
            <CardLabel icon={Briefcase}>Şu an</CardLabel>
            <span className="relative mt-1 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
          </div>
          <div className="mt-5 sm:mt-8 lg:mt-auto">
            <p className="text-lg font-medium leading-snug text-zinc-100">{current.company}</p>
            <p className="mt-1 text-sm text-zinc-400">{current.role}</p>
            <p className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {current.since}
            </p>
          </div>
        </Card>

        {/* GitHub */}
        <a
          href={social.github.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardClass()} ${linkCard}`}
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-start justify-between">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-zinc-950 shadow-[0_8px_24px_-8px_rgba(255,255,255,0.45)]">
              <GitHubIcon className="size-6" />
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-5 text-zinc-500 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            />
          </div>
          <div className="mt-5 sm:mt-8">
            <p className="font-medium text-zinc-100">GitHub</p>
            <p className="mt-0.5 truncate text-sm text-zinc-400">{social.github.handle}</p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">Kodlarım ve projelerim</p>
          </div>
        </a>

        {/* Konum */}
        <Card className="col-span-2 flex flex-col gap-3 overflow-hidden sm:flex-row sm:gap-6" delay={180}>
          <div className="flex shrink-0 flex-col">
            <CardLabel icon={MapPin}>Konum</CardLabel>
            <div className="mt-4 sm:mt-auto">
              <LocalClock timeZone={location.timeZone} city={location.city} />
            </div>
          </div>
          <RouteArc className="w-full max-w-[19rem] self-center sm:ml-auto sm:self-end" />
        </Card>

        {/* Odak alanları */}
        <Card className="col-span-2 flex flex-col" delay={240}>
          <CardLabel icon={Sparkles}>Odak alanları</CardLabel>
          <ul className="mt-5 flex flex-wrap gap-2">
            {cvData.focus.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2.5 pr-3.5 text-sm text-zinc-200 transition-colors hover:border-sky-400/40 hover:bg-sky-400/10"
              >
                <Icon aria-hidden="true" className="size-4 text-sky-300" />
                {label}
              </li>
            ))}
          </ul>
        </Card>

        {/* Eğitim */}
        <Card className="col-span-2 md:col-span-1" delay={300}>
          <CardLabel icon={GraduationCap}>Eğitim</CardLabel>
          <p className="mt-5 font-medium leading-snug text-zinc-100">{education.school}</p>
          <p className="mt-1 text-sm text-zinc-400">{education.department}</p>
          <ol className="mt-5 space-y-3 border-l border-white/10 pl-4">
            {education.degrees.map((degree, index) => (
              <li key={degree.level} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[21px] top-[5px] size-[9px] rounded-full border ${
                    index === 0
                      ? 'border-sky-300 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
                      : 'border-white/30 bg-[#0f1f40]'
                  }`}
                />
                <p className="text-sm leading-5 text-zinc-200">{degree.level}</p>
                <p className="text-xs text-zinc-400">{degree.status}</p>
              </li>
            ))}
          </ol>
        </Card>

        {/* LinkedIn */}
        <a
          href={social.linkedin.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardClass('linkedin')} ${linkCard}`}
          style={{ animationDelay: '340ms' }}
        >
          <div className="flex items-start justify-between">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#0a66c2] text-white shadow-[0_8px_24px_-8px_rgba(10,102,194,0.9)]">
              <LinkedInIcon className="size-5" />
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-5 text-sky-200/60 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            />
          </div>
          <div className="mt-5 sm:mt-8">
            <p className="font-medium text-zinc-100">LinkedIn</p>
            <p className="mt-0.5 truncate text-sm text-sky-100/70">{social.linkedin.handle}</p>
            <p className="mt-3 text-xs leading-relaxed text-sky-100/70">Deneyimlerim ve bağlantılarım</p>
          </div>
        </a>

        {/* Teknolojiler */}
        <Card className="marquee-pause col-span-2 flex flex-col overflow-hidden" delay={380}>
          <CardLabel icon={Layers}>Teknolojiler</CardLabel>
          <div className="mask-fade-x -mx-5 mt-5 space-y-2.5 sm:-mx-6 lg:mt-auto lg:pt-5">
            {cvData.stack.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`marquee flex w-max gap-2.5 pr-2.5 ${rowIndex % 2 === 1 ? 'marquee-reverse' : ''}`}
              >
                {[...row, ...row].map((tech, index) => (
                  <span
                    key={index}
                    aria-hidden={index >= row.length || undefined}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-zinc-300"
                  >
                    {tech.icon && (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="size-3.5"
                        fill={readableBrandColor(tech.icon.hex)}
                      >
                        <path d={tech.icon.path} />
                      </svg>
                    )}
                    {tech.name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Araçlar */}
        <Link
          href="/araclar"
          className="fade-up group relative col-span-2 overflow-hidden rounded-3xl p-px transition-transform duration-300 hover:-translate-y-1"
          style={{ animationDelay: '440ms' }}
        >
          {/* The rotating light is masked to the 1px ring, so the card itself can stay translucent glass */}
          <span aria-hidden="true" className="border-ring absolute inset-0 overflow-hidden rounded-3xl p-px">
            <span className="absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,rgba(125,211,252,0.95)_315deg,rgba(94,234,212,0.95)_350deg,transparent_360deg)] motion-reduce:animate-none" />
          </span>
          <span aria-hidden="true" className="absolute inset-0 rounded-3xl border border-white/15" />
          <div
            className={`spotlight relative flex h-full flex-col gap-6 overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0a1530]/65 p-5 sm:flex-row sm:items-center sm:p-6 ${glassShadow}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-500/[0.16] via-sky-500/[0.05] to-cyan-500/[0.06]"
            />
            <div className="relative flex-1">
              <div className="flex items-center gap-2">
                <CardLabel icon={Wrench}>Araçlar</CardLabel>
                <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200">
                  Yeni
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold tracking-tight text-zinc-50">
                Kendi geliştirdiğim küçük araçlar
              </p>
              <p className="mt-1.5 text-sm text-zinc-400">
                {tools.length > 0 ? `${tools.length} araç yayında` : 'İlk araçlar çok yakında burada.'}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sky-300">
                Araçlara göz at
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </div>
            <ToolStack className="hidden shrink-0 self-center sm:block" />
          </div>
        </Link>
      </SpotlightGrid>
    </main>
  );
}
