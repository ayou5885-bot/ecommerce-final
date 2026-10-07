import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice } from '@/config/site';
import { useI18n } from '@/i18n/I18nContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useI18n();
  const { addToCart } = useCart();
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const isOutOfStock = product.stock_quantity === 0 || product.availability === 'out-of-stock';

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg px-4 py-2 rounded-full bg-red-500/90">
              {t('outOfStock')}
            </span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-3 start-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold">
            <AlertTriangle size={12} />
            {t('lowStockBadge')}
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
            {t('featured')}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brand}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(Number(product.price))}
          </span>
          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product, 1);
              }}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label={t('addToCart')}
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
