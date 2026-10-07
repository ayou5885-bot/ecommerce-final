import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/i18n/I18nContext';
import { ProductCard } from '@/components/ProductCard';
import type { LandingPage, ContentBlock } from '@/types';

export function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useProducts();
  const { t } = useI18n();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle();
      setPage(data as LandingPage | null);
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl text-gray-500">Page not found</p>
      </div>
    );
  }

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case 'heading':
        return <h2 key={idx} className="text-3xl font-bold text-center mb-4">{block.text}</h2>;
      case 'paragraph':
        return <p key={idx} className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-4">{block.text}</p>;
      case 'image':
        return (
          <div key={idx} className="rounded-2xl overflow-hidden mb-6 max-w-4xl mx-auto">
            <img src={block.image} alt="" className="w-full object-cover" />
          </div>
        );
      case 'banner':
        return (
          <div key={idx} className="relative h-64 rounded-2xl overflow-hidden mb-6 max-w-4xl mx-auto">
            <img src={block.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="px-8 max-w-lg">
                <h3 className="text-2xl font-bold text-white mb-2">{block.text}</h3>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div key={idx} className="mb-8">
            {block.text && <h3 className="text-xl font-bold mb-4 text-center">{block.text}</h3>}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {(block.product_ids ?? [])
                .map((id) => products.find((p) => p.id === id))
                .filter((p) => p !== undefined)
                .map((p) => (
                  <ProductCard key={p!.id} product={p!} />
                ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {page.hero_image && (
        <div className="relative h-[400px] sm:h-[500px] overflow-hidden bg-gray-900">
          <img src={page.hero_image} alt={page.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{page.title}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {!page.hero_image && <h1 className="text-4xl font-bold text-center mb-8">{page.title}</h1>}
        {(page.content_blocks ?? []).map((block, idx) => renderBlock(block, idx))}
      </div>
    </div>
  );
}
