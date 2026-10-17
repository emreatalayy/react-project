import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavTabs } from "./components/NavTabs";
import "./globals.css";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Yunus Emre Atalay — Bilgisayar Mühendisi",
    template: "%s — Yunus Emre Atalay",
  },
  description:
    "Doğal dil işleme, büyük dil modelleri ve yapay zekâ ajanları üzerine çalışan bilgisayar mühendisi.",
};

export const viewport: Viewport = {
  themeColor: "#0a1a3f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <div aria-hidden="true" className="wallpaper pointer-events-none fixed inset-0 -z-10" />

        <header className="sticky top-0 z-50 px-4 pt-4">
          <nav
            aria-label="Ana menü"
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-[#0b1834]/60 p-1.5 shadow-[0_8px_32px_-8px_rgba(3,12,32,0.6)] backdrop-blur-xl"
          >
            <Link
              href="/"
              aria-label="Ana sayfa"
              className="grid size-8 place-items-center rounded-full bg-linear-to-br from-blue-400 via-sky-400 to-cyan-300 text-sm font-bold text-zinc-950"
            >
              E
            </Link>
            <span aria-hidden="true" className="h-5 w-px bg-white/15" />
            <NavTabs />
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1834]/45 px-5 py-4 text-xs text-white/75 backdrop-blur-xl">
            <span>© {new Date().getFullYear()} Yunus Emre Atalay</span>
            <span>İstanbul · Trabzon</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
