import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import { LanguageProvider } from './context/LanguageContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yunus Emre Atalay - AI Developer",
  description: "AI and machine learning developer specialized in innovative solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
