import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { useI18n } from '@/i18n/I18nContext';
import { formatPrice } from '@/config/site';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/admin/ImageUpload';
import type { Product, Specification } from '@/types';
import { Plus, Pencil, Trash2, X, AlertTriangle, Save } from 'lucide-react';

const emptyForm: Partial<Product> = {
  id: '',
  brand: '',
  name: '',
  slug: '',
  category: '',
  price: 0,
  image: '',
  short_description: '',
  description: '',
  specifications: [],
  features: [],
  availability: 'in-stock',
  featured: false,
  stock_quantity: 0,
  low_stock_threshold: 3,
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminProductsPage() {
  const { products, loading, refetch } = useProducts();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyForm);
  const [featureInput, setFeatureInput] = useState('');
  const [specInput, setSpecInput] = useState<Specification>({ label: '', value: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, specifications: p.specifications ?? [], features: p.features ?? [] });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const data = {
      ...form,
      slug: form.slug || slugify(form.name || ''),
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
      specifications: form.specifications ?? [],
      features: form.features ?? [],
    };

    if (editing) {
      const { error: e } = await supabase.from('products').update(data).eq('id', editing.id);
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.from('products').insert({ ...data, id: data.id || slugify(form.name || '') });
      if (e) setError(e.message);
    }

    if (!error) {
      refetch();
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(t('confirmDelete'))) return;
    await supabase.from('products').delete().eq('id', p.id);
    refetch();
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({ ...f, features: [...(f.features ?? []), featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const addSpec = () => {
    if (specInput.label.trim() && specInput.value.trim()) {
      setForm((f) => ({ ...f, specifications: [...(f.specifications ?? []), { ...specInput }] }));
      setSpecInput({ label: '', value: '' });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('products')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} /> {t('addNew')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-start">
              <th className="p-3 text-start font-medium text-gray-500">{t('image')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('name')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('brand')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('price')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('stock')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="p-3"><img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" /></td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-gray-500">{p.brand}</td>
                <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{formatPrice(Number(p.price))}</td>
                <td className="p-3">
                  <span className={p.stock_quantity <= p.low_stock_threshold ? 'text-orange-600 font-semibold' : ''}>
                    {p.stock_quantity}
                  </span>
                  {p.stock_quantity <= p.low_stock_threshold && (
                    <AlertTriangle size={12} className="inline ms-1 text-orange-600" />
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={t('edit')}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={t('delete')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t('edit') : t('addNew')}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-1">
              <ImageUpload value={form.image ?? null} onChange={(url) => setForm((f) => ({ ...f, image: url }))} folder="products" label={t('productImage')} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('name')} *</label>
                  <input type="text" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('slug')}</label>
                  <input type="text" value={form.slug ?? ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('brand')} *</label>
                  <select value={form.brand ?? ''} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500">
                    <option value="">{t('selectBrand')}</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('category')} *</label>
                  <select value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500">
                    <option value="">{t('selectCategory')}</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('price')} (DZD) *</label>
                  <input type="number" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('availability')}</label>
                  <select value={form.availability ?? 'in-stock'} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500">
                    <option value="in-stock">{t('inStock')}</option>
                    <option value="out-of-stock">{t('outOfStock')}</option>
                    <option value="pre-order">{t('preOrder')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('stock')}</label>
                  <input type="number" value={form.stock_quantity ?? 0} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('lowStockThreshold')}</label>
                  <input type="number" value={form.low_stock_threshold ?? 3} onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('shortDescription')}</label>
                <input type="text" value={form.short_description ?? ''} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fullDescription')}</label>
                <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('features')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} placeholder={t('addFeature')} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                  <button type="button" onClick={addFeature} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium"><Plus size={16} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.features ?? []).map((f, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                      {f}
                      <button onClick={() => setForm((prev) => ({ ...prev, features: prev.features?.filter((_, i) => i !== idx) }))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('specifications')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={specInput.label} onChange={(e) => setSpecInput((s) => ({ ...s, label: e.target.value }))} placeholder={t('label')} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                  <input type="text" value={specInput.value} onChange={(e) => setSpecInput((s) => ({ ...s, value: e.target.value }))} placeholder={t('value')} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                  <button type="button" onClick={addSpec} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium"><Plus size={16} /></button>
                </div>
                <div className="space-y-1">
                  {(form.specifications ?? []).map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <span className="flex-1 text-gray-500">{spec.label}</span>
                      <span className="flex-1 font-medium">{spec.value}</span>
                      <button onClick={() => setForm((prev) => ({ ...prev, specifications: prev.specifications?.filter((_, i) => i !== idx) }))} className="text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" />
                {t('featured')}
              </label>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium">{t('cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium">
                <Save size={16} /> {saving ? '...' : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
