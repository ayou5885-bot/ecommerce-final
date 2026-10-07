import { useState } from 'react';
import { useCoupons } from '@/hooks/useCoupons';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const emptyForm: Partial<Coupon> = {
  code: '', discount_type: 'percent', discount_value: 0, expires_at: null, active: true, usage_limit: null,
};

export function AdminCouponsPage() {
  const { coupons, loading, refetch } = useCoupons();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0, 10) : null }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    const data = {
      code: form.code?.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: form.active,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    };
    if (editing) {
      const { error: e } = await supabase.from('coupons').update(data).eq('id', editing.id);
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.from('coupons').insert(data);
      if (e) setError(e.message);
    }
    if (!error) { refetch(); setShowForm(false); }
    setSaving(false);
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(t('confirmDelete'))) return;
    await supabase.from('coupons').delete().eq('id', c.id);
    refetch();
  };

  const handleToggleActive = async (c: Coupon) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    refetch();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('coupons')}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus size={16} /> {t('addNew')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="p-3 text-start font-medium text-gray-500">{t('code')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('discountType')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('discountValue')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('active')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('usageLimit')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('times')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="p-3 font-mono font-semibold">{c.code}</td>
                <td className="p-3">{c.discount_type === 'percent' ? '%' : 'DZD'}</td>
                <td className="p-3">{c.discount_type === 'percent' ? `${c.discount_value}%` : formatPrice(Number(c.discount_value))}</td>
                <td className="p-3">
                  <button onClick={() => handleToggleActive(c)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {c.active ? t('active') : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-gray-500">{c.usage_limit ?? '∞'}</td>
                <td className="p-3">{c.times_used}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t('edit') : t('addNew')}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">{t('code')} *</label><input type="text" value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500 font-mono uppercase" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('discountType')}</label><select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"><option value="percent">Percent (%)</option><option value="fixed">Fixed (DZD)</option></select></div>
              <div><label className="block text-sm font-medium mb-1">{t('discountValue')} *</label><input type="number" value={form.discount_value ?? 0} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('expiresAt')}</label><input type="date" value={form.expires_at ?? ''} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value || null }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('usageLimit')}</label><input type="number" value={form.usage_limit ?? ''} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))} placeholder="∞" className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded" /> {t('active')}</label>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium">{t('cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium"><Save size={16} /> {saving ? '...' : t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
