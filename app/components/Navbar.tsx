'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isProjectPage = pathname === '/projects';

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${
      isProjectPage 
        ? 'bg-white shadow-md' 
        : 'nav-glass'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className={`flex items-center text-xl font-semibold transition-colors ${
                isProjectPage 
                  ? 'text-gray-900 hover:text-gray-700' 
                  : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              YEA
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className={`inline-flex items-center px-1 pt-1 transition-colors ${
                isProjectPage 
                  ? 'text-gray-700 hover:text-gray-900' 
                  : 'text-blue-300 hover:text-blue-200'
              }`}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/projects" 
              className={`inline-flex items-center px-1 pt-1 transition-colors ${
                isProjectPage 
                  ? 'text-gray-700 hover:text-gray-900' 
                  : 'text-blue-300 hover:text-blue-200'
              }`}
            >
              Projeler
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 