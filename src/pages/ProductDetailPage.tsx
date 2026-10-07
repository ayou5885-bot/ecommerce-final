import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingCart, ArrowLeft, AlertTriangle, Check, Minus, Plus } from 'lucide-react';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-500 mb-4">Product not found</p>
        <Link to="/shop" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const isOutOfStock = product.stock_quantity === 0 || product.availability === 'out-of-stock';

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('continueShopping')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-4 start-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-sm font-semibold">
              <AlertTriangle size={14} />
              {t('lowStock', { n: product.stock_quantity })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {formatPrice(Number(product.price))}
          </p>

          {product.short_description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.short_description}</p>
          )}

          {/* Availability */}
          <div className="mb-6">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                {t('outOfStock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <Check size={14} />
                {t('inStock')}
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-s-lg transition-colors"
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-e-lg transition-colors"
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                <ShoppingCart size={20} />
                {t('addToCart')}
              </button>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('features')}</h3>
              <ul className="space-y-2">
                {product.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check size={16} className="shrink-0 text-green-500 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">{t('description')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('specifications')}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between px-4 py-2.5 text-sm ${
                      idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    <span className="text-gray-500 dark:text-gray-400">{spec.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">{t('relatedProducts')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
