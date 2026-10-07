import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { formatPrice } from '@/config/site';
import { useI18n } from '@/i18n/I18nContext';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

export function HomePage() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { t } = useI18n();

  const featured = products.filter((p) => p.featured).slice(0, 5);
  const newest = [...products].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);
  const bestSellers = products.filter((p) => p.stock_quantity > 0).slice(0, 8);

  const slides: Product[] = featured.length > 0 ? featured : newest.slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Carousel */}
      {slides.length > 0 && (
        <section className="relative h-[400px] sm:h-[500px] overflow-hidden bg-gray-900">
          {slides.map((product, idx) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-lg">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold mb-3">
                    {product.brand}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                    {product.name}
                  </h2>
                  {product.short_description && (
                    <p className="text-gray-200 text-base sm:text-lg mb-4 line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-blue-400 mb-4">
                    {formatPrice(Number(product.price))}
                  </p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    {t('viewAll')}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute start-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">{t('shopByCategory')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <span className="text-white font-semibold text-sm">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t('newArrivals')}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('newArrivalsDesc')}</p>
            </div>
            <Link to="/shop" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t('bestSellers')}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('bestSellersDesc')}</p>
            </div>
            <Link to="/shop" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
