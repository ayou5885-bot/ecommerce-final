import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, DollarSign, Package } from 'lucide-react';
import type { Order } from '@/types';

export function AdminDashboardPage() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const todaysSales = orders
      .filter((o) => o.status !== 'cancelled' && new Date(o.created_at) >= todayStart)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const weekSales = orders
      .filter((o) => o.status !== 'cancelled' && new Date(o.created_at) >= weekStart)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const lowStockCount = products.filter(
      (p) => p.stock_quantity <= p.low_stock_threshold
    ).length;

    return { todaysSales, weekSales, pendingCount, lowStockCount };
  }, [orders, products]);

  const chartData = useMemo(() => {
    const days: { label: string; sales: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySales = orders
        .filter((o) => {
          const od = new Date(o.created_at);
          return o.status !== 'cancelled' && od >= dayStart && od < dayEnd;
        })
        .reduce((sum, o) => sum + Number(o.total), 0);

      days.push({
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        sales: daySales,
      });
    }
    return days;
  }, [orders]);

  const cards = [
    { label: t('todaysSales'), value: formatPrice(stats.todaysSales), icon: DollarSign, color: 'blue' },
    { label: t('thisWeekSales'), value: formatPrice(stats.weekSales), icon: TrendingUp, color: 'cyan' },
    { label: t('pendingOrders'), value: String(stats.pendingCount), icon: Clock, color: 'orange' },
    { label: t('lowStockProducts'), value: String(stats.lowStockCount), icon: AlertTriangle, color: 'red' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-xl font-bold mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Package size={18} className="text-blue-600" />
          {t('salesLast7Days')}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(v) => [formatPrice(Number(v)), t('total')]}
            />
            <Bar dataKey="sales" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
