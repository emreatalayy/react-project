'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { articles } from './data';

export default function Articles() {
  const { language } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const translations = {
    tr: {
      title: 'Makaleler',
      allTags: 'Tüm Etiketler',
      readMore: 'Devamını Oku',
      publishedOn: 'Yayınlanma:',
      by: 'Yazar:',
      filterByTag: 'Etikete Göre Filtrele:',
      noArticles: 'Seçilen etiketle ilgili makale bulunamadı.'
    },
    en: {
      title: 'Articles',
      allTags: 'All Tags',
      readMore: 'Read More',
      publishedOn: 'Published on:',
      by: 'By:',
      filterByTag: 'Filter by Tag:',
      noArticles: 'No articles found with the selected tag.'
    }
  }[language];

  // Tüm etiketleri topla
  const allTags = Array.from(new Set(articles.flatMap(article => article.tags)));
  
  // Filtrelenmiş makaleler
  const filteredArticles = selectedTag 
    ? articles.filter(article => article.tags.includes(selectedTag))
    : articles;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {translations.title}
        </motion.h1>
        
        {/* Tag filters */}
        <div className="mb-12">
          <p className="text-gray-600 mb-4 text-center">{translations.filterByTag}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTag === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {translations.allTags}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Articles grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/articles/${article.id}`}>
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-5xl">
                      {article.title.charAt(0)}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900">{article.title}</h2>
                    <p className="text-gray-600 mb-4 text-sm">{article.description}</p>
                    <div className="text-gray-500 text-xs">
                      <p>{translations.publishedOn} {article.publishDate}</p>
                      <p>{translations.by} {article.author}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-12">
            <p>{translations.noArticles}</p>
          </div>
        )}
      </div>
    </div>
  );
} 