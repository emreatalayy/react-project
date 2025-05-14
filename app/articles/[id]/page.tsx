import ArticleClient from './ArticleClient';
import { articles } from '../data';

export function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export default function Page() {
  return <ArticleClient />;
} 