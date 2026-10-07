import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import type { Order, OrderStatus } from '@/types';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export function TrackOrderPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !token.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    const { data, error: rpcError } = await supabase.rpc('track_order', {
      p_phone: phone.trim(),
      p_token: token.trim(),
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setOrder(data[0] as Order);
    } else {
      setError(t('orderNotFound'));
    }
    setSearched(true);
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get('phone') && searchParams.get('token')) {
      handleTrack(new Event('submit') as unknown as React.FormEvent);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('trackOrder')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('trackDesc')}</p>
      </div>

      <form onSubmit={handleTrack} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">{t('enterPhone')}</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+213 555 000 000"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('enterToken')}</label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="abc123"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 text-sm font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          <Search size={18} />
          {loading ? '...' : t('trackBtn')}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderStatus')}</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mt-1 ${statusColors[order.status]}`}>
                {(() => {
                  const Icon = statusIcons[order.status];
                  return <Icon size={16} />;
                })()}
                {t(order.status)}
              </div>
            </div>
            <div className="text-end">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDate')}</p>
              <p className="font-medium text-sm mt-1">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Status timeline */}
          <div className="flex items-center justify-between px-2 py-4">
            {(['pending', 'confirmed', 'shipped', 'delivered'] as OrderStatus[]).map((s, idx, arr) => {
              const currentIdx = arr.indexOf(order.status as OrderStatus);
              const isActive = idx <= currentIdx && order.status !== 'cancelled';
              const Icon = statusIcons[s];
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={`text-xs ${isActive ? 'font-medium' : 'text-gray-400'}`}>
                      {t(s)}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 -mt-5 ${idx < currentIdx && order.status !== 'cancelled' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="font-semibold mb-3 text-sm">{t('orderItems')}</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{t('quantity')}: {item.quantity}</p>
                  </div>
                  <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('shipping')}</span>
              <span>{formatPrice(Number(order.shipping))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>{t('discount')}</span>
                <span>-{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>{t('total')}</span>
              <span className="text-blue-600 dark:text-blue-400">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
