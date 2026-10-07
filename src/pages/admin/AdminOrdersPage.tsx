import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import type { Order, OrderStatus } from '@/types';
import {
  ChevronDown, ChevronRight, Download, MessageCircle, Search,
} from 'lucide-react';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const { orders, refetch, setOrders } = useOrders();
  const { products } = useProducts();
  const { t, lang } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.tracking_token.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    return result;
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));

    if (newStatus === 'delivered' && order.status !== 'delivered') {
      // Decrement stock for each item — done via direct updates since checkout never touches stock
      for (const item of order.items) {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          const newQty = Math.max(0, product.stock_quantity - item.quantity);
          await supabase
            .from('products')
            .update({ stock_quantity: newQty })
            .eq('id', product.id);
        }
      }
    }

    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    refetch();
  };

  const handleExport = () => {
    const rows = filtered.map((o) => ({
      Date: new Date(o.created_at).toLocaleString(),
      Customer: o.customer_name,
      Phone: o.customer_phone,
      Email: o.customer_email,
      Wilaya: o.wilaya_name,
      Address: o.address,
      Items: o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
      Subtotal: Number(o.subtotal),
      Shipping: Number(o.shipping),
      Discount: Number(o.discount),
      Total: Number(o.total),
      Status: o.status,
      'Tracking Token': o.tracking_token,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getWhatsAppLink = (order: Order) => {
    const statusLabel = t(order.status);
    const msg = t('whatsappMessage', { name: order.customer_name, status: statusLabel });
    const phone = order.customer_phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('orders')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            <Download size={16} />
            {t('exportExcel')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchOrders')}
            className="w-full ps-9 pe-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
        >
          <option value="">{t('allAvailability')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(s)}</option>
          ))}
        </select>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{t('noOrders')}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {expandedId === order.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} · {order.wilaya_name}
                  </p>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm shrink-0 hidden sm:block">
                  {formatPrice(Number(order.total))}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border-0 outline-none cursor-pointer ${
                    order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    order.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    order.status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                    order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{t(s)}</option>
                  ))}
                </select>
                <a
                  href={getWhatsAppLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shrink-0"
                  aria-label={t('contactCustomer')}
                  title={t('contactCustomer')}
                >
                  <MessageCircle size={16} />
                </a>
              </div>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('phone')}</p>
                      <p className="font-medium">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('email')}</p>
                      <p className="font-medium">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('address')}</p>
                      <p className="font-medium">{order.address}, {order.wilaya_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('trackingToken')}</p>
                      <p className="font-mono font-medium">{order.tracking_token}</p>
                    </div>
                    {order.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">{t('notes')}</p>
                        <p className="font-medium">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm font-semibold mb-2">{t('orderItems')}</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="flex-1 truncate">{item.name}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">{t('subtotal')}</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('shipping')}</span><span>{formatPrice(Number(order.shipping))}</span></div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between text-green-600"><span>{t('discount')}</span><span>-{formatPrice(Number(order.discount))}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1"><span>{t('total')}</span><span className="text-blue-600 dark:text-blue-400">{formatPrice(Number(order.total))}</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
