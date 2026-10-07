import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { t, dir } = useI18n();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('cartEmpty')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('cartEmptyDesc')}</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('cart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-s-lg transition-colors"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-e-lg transition-colors"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="font-bold w-24 text-end shrink-0 hidden sm:block">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                aria-label={t('remove')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="font-bold text-lg">{t('total')}</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
              <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('shipping')}</span>
              <span className="text-gray-500">{t('pending')}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <span className="font-bold">{t('subtotal')}</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              {t('checkout')}
              {dir === 'ltr' ? <ArrowRight size={18} /> : <ArrowRight size={18} className="rotate-180" />}
            </Link>
            <Link
              to="/shop"
              className="block text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
