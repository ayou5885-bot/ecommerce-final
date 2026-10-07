import { useState } from 'react';
import { useBrands } from '@/hooks/useBrands';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import type { Brand } from '@/types';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminBrandsPage() {
  const { brands, loading, refetch } = useBrands();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Partial<Brand>>({ id: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditing(null); setForm({ id: '', name: '' }); setError(''); setShowForm(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ ...b }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    if (editing) {
      const { error: e } = await supabase.from('brands').update(form).eq('id', editing.id);
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.from('brands').insert({ ...form, id: form.id || slugify(form.name || '') });
      if (e) setError(e.message);
    }
    if (!error) { refetch(); setShowForm(false); }
    setSaving(false);
  };

  const handleDelete = async (b: Brand) => {
    if (!confirm(t('confirmDelete'))) return;
    await supabase.from('brands').delete().eq('id', b.id);
    refetch();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('brands')}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus size={16} /> {t('addNew')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/50">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-3">
            <span className="font-medium">{b.name}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(b)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {brands.length === 0 && <p className="p-8 text-center text-gray-500">No brands yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t('edit') : t('addNew')}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">{t('name')} *</label><input type="text" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, id: f.id || slugify(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
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
