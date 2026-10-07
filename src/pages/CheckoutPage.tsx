import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useWilayas } from '@/hooks/useWilayas';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice, siteConfig } from '@/config/site';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { CheckCircle2, Tag, X, Copy, Check, Truck, Banknote } from 'lucide-react';

export function CheckoutPage() {
  const { items, cartSubtotal, clearCart } = useCart();
  const { wilayas } = useWilayas();
  const { t, lang, dir } = useI18n();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    wilaya_code: '',
    address: '',
    notes: '',
  });

  const [selectedWilaya, setSelectedWilaya] = useState<{ name: string; shipping_price: number } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ discount: number; type: string } | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('cartEmpty')}</h1>
        <Link to="/shop" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const shipping = selectedWilaya ? Number(selectedWilaya.shipping_price) : 0;
  const discount = couponApplied
    ? couponApplied.type === 'percent'
      ? Math.round((cartSubtotal * couponApplied.discount) / 100)
      : couponApplied.discount
    : 0;
  const total = Math.max(0, cartSubtotal + shipping - discount);

  const handleWilayaChange = (code: string) => {
    setFormData((prev) => ({ ...prev, wilaya_code: code }));
    const w = wilayas.find((wl) => wl.code === code);
    if (w) {
      setSelectedWilaya({ name: lang === 'ar' ? w.name_ar : w.name_fr, shipping_price: Number(w.shipping_price) });
      setFormData((prev) => ({ ...prev, wilaya_name: w.name_fr }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMessage('');
    const { data, error: rpcError } = await supabase.rpc('validate_coupon', {
      coupon_code: couponCode.trim(),
      order_subtotal: cartSubtotal,
    });

    if (rpcError) {
      setCouponMessage(t('couponInvalid'));
      setCouponApplied(null);
      return;
    }

    const result = data?.[0];
    if (result?.valid) {
      setCouponApplied({ discount: Number(result.discount_value), type: result.discount_type });
      setCouponMessage(t('couponApplied'));
    } else {
      setCouponApplied(null);
      setCouponMessage(result?.message ?? t('couponInvalid'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWilaya) {
      setError(t('selectWilaya'));
      return;
    }
    setSubmitting(true);
    setError('');

    const orderData = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      wilaya_code: formData.wilaya_code,
      wilaya_name: selectedWilaya.name,
      address: formData.address,
      notes: formData.notes || null,
      items: JSON.stringify(items),
      subtotal: cartSubtotal,
      shipping,
      discount,
      coupon_code: couponApplied ? couponCode.trim() : null,
      total,
    };

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .maybeSingle();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setPlacedOrder(data as Order);
    clearCart();
    setSubmitting(false);
  };

  const trackingUrl = placedOrder
    ? `${window.location.origin}/track?phone=${encodeURIComponent(placedOrder.customer_phone)}&token=${placedOrder.tracking_token}`
    : '';

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Confirmation screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('orderPlaced')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('orderPlacedDesc')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('total')}</span>
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {formatPrice(Number(placedOrder.total))}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">{t('trackingLink')}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 outline-none"
              />
              <button
                onClick={copyTrackingLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('copied') : t('copyLink')}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to={`/track?phone=${encodeURIComponent(placedOrder.customer_phone)}&token=${placedOrder.tracking_token}`}
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
            >
              {t('trackOrder')}
            </Link>
            <Link
              to="/shop"
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('checkoutTitle')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-lg mb-4">{t('contactInfo')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('phone')} *</label>
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-lg mb-4">{t('shippingAddress')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('wilaya')} *</label>
                <select
                  required
                  value={formData.wilaya_code}
                  onChange={(e) => handleWilayaChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">{t('selectWilaya')}</option>
                  {wilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {lang === 'ar' ? w.name_ar : w.name_fr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('address')} *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('notes')}</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Banknote size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t('cashOnDelivery')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('cashOnDeliveryDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="font-bold text-lg">{t('total')}</h2>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{t('quantity')}: {item.quantity}</p>
                  </div>
                  <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t('couponCode')}
                    className="w-full ps-9 pe-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  {t('applyCoupon')}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${couponApplied ? 'text-green-600' : 'text-red-500'}`}>
                  {couponApplied ? <Check size={12} /> : <X size={12} />}
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
                <span className="font-medium">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Truck size={14} />
                  {t('shipping')}
                </span>
                <span className="font-medium">{formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t('discount')}</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
                <span className="font-bold">{t('total')}</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ...
                </span>
              ) : (
                t('placeOrder')
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
