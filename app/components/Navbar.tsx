'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { IoLanguage } from 'react-icons/io5';

export default function Navbar() {
  const pathname = usePathname();
  const isProjectPage = pathname === '/projects';
  const isArticlePage = pathname.startsWith('/articles');
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { href: '/', text: t.nav.home },
    { href: '/projects', text: t.nav.projects },
    { href: '/articles', text: t.nav.articles }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${
      isProjectPage || isArticlePage ? 'bg-white shadow-md' : 'nav-glass'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className={`flex items-center text-xl font-semibold transition-colors ${
                isProjectPage || isArticlePage
                  ? 'text-gray-900 hover:text-gray-700' 
                  : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              YEA
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center px-1 pt-1 transition-colors ${
                  isProjectPage || isArticlePage
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-blue-300 hover:text-blue-200'
                }`}
              >
                {link.text}
              </Link>
            ))}
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                isProjectPage || isArticlePage
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'bg-white/10 hover:bg-white/20 text-blue-200'
              }`}
            >
              <IoLanguage className="text-lg" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 