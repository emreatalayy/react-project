'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { articles } from './page';

export default function ArticleClient() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [article, setArticle] = useState<typeof articles[0] | null>(null);

  const translations = {
    tr: {
      backToArticles: 'Makalelere Dön',
      publishedOn: 'Yayınlanma Tarihi:',
      author: 'Yazar:',
      tags: 'Etiketler:',
      articleNotFound: 'Makale bulunamadı.'
    },
    en: {
      backToArticles: 'Back to Articles',
      publishedOn: 'Published on:',
      author: 'Author:',
      tags: 'Tags:',
      articleNotFound: 'Article not found.'
    }
  }[language];

  useEffect(() => {
    const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
    const foundArticle = articles.find(a => a.id === articleId);
    setArticle(foundArticle || null);
  }, [params.id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">{translations.articleNotFound}</h1>
          <button
            onClick={() => router.push('/articles')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" /> {translations.backToArticles}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/articles')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> {translations.backToArticles}
          </button>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-gray-600 mb-8">
              <p>{translations.publishedOn} {article.publishDate}</p>
              <p>{translations.author} {article.author}</p>
            </div>
            <div 
              className="prose prose-lg max-w-none prose-headings:text-blue-700 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.article>
      </div>
    </div>
  );
} 