import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/admin/ImageUpload';
import type { Category } from '@/types';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminCategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({ id: '', name: '', slug: '', description: '', image: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditing(null); setForm({ id: '', name: '', slug: '', description: '', image: null }); setError(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ ...c }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    const data = { ...form, slug: form.slug || slugify(form.name || '') };
    if (editing) {
      const { error: e } = await supabase.from('categories').update(data).eq('id', editing.id);
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.from('categories').insert({ ...data, id: data.id || slugify(form.name || '') });
      if (e) setError(e.message);
    }
    if (!error) { refetch(); setShowForm(false); }
    setSaving(false);
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(t('confirmDelete'))) return;
    await supabase.from('categories').delete().eq('id', c.id);
    refetch();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('categories')}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus size={16} /> {t('addNew')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
            {c.image ? (
              <img src={c.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">📦</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-xs text-gray-500 truncate">{c.slug}</p>
            </div>
            <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil size={16} /></button>
            <button onClick={() => handleDelete(c)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t('edit') : t('addNew')}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <ImageUpload value={form.image ?? null} onChange={(url) => setForm((f) => ({ ...f, image: url }))} folder="categories" label={t('categoryImage')} />
              <div><label className="block text-sm font-medium mb-1">{t('name')} *</label><input type="text" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('slug')}</label><input type="text" value={form.slug ?? ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('description')}</label><textarea rows={2} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500 resize-none" /></div>
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
