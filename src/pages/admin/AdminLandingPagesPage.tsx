import { useState } from 'react';
import { useLandingPages } from '@/hooks/useLandingPages';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/admin/ImageUpload';
import type { LandingPage, ContentBlock } from '@/types';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const emptyForm: Partial<LandingPage> = {
  slug: '', title: '', hero_image: null, content_blocks: [], active: false, starts_at: null, ends_at: null,
};

export function AdminLandingPagesPage() {
  const { landingPages, loading, refetch } = useLandingPages();
  const { products } = useProducts();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [form, setForm] = useState<Partial<LandingPage>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, content_blocks: [] }); setError(''); setShowForm(true); };
  const openEdit = (p: LandingPage) => { setEditing(p); setForm({ ...p, content_blocks: p.content_blocks ?? [] }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    const data = {
      ...form,
      slug: form.slug || slugify(form.title || ''),
      content_blocks: form.content_blocks ?? [],
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    if (editing) {
      const { error: e } = await supabase.from('landing_pages').update(data).eq('slug', editing.slug);
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.from('landing_pages').insert(data);
      if (e) setError(e.message);
    }
    if (!error) { refetch(); setShowForm(false); }
    setSaving(false);
  };

  const handleDelete = async (p: LandingPage) => {
    if (!confirm(t('confirmDelete'))) return;
    await supabase.from('landing_pages').delete().eq('slug', p.slug);
    refetch();
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = { type };
    if (type === 'products') newBlock.product_ids = [];
    if (type === 'heading' || type === 'paragraph') newBlock.text = '';
    setForm((f) => ({ ...f, content_blocks: [...(f.content_blocks ?? []), newBlock] }));
  };

  const updateBlock = (idx: number, updates: Partial<ContentBlock>) => {
    setForm((f) => ({
      ...f,
      content_blocks: (f.content_blocks ?? []).map((b, i) => (i === idx ? { ...b, ...updates } : b)),
    }));
  };

  const removeBlock = (idx: number) => {
    setForm((f) => ({ ...f, content_blocks: (f.content_blocks ?? []).filter((_, i) => i !== idx) }));
  };

  const toggleProductInBlock = (idx: number, productId: string) => {
    setForm((f) => ({
      ...f,
      content_blocks: (f.content_blocks ?? []).map((b, i) => {
        if (i !== idx) return b;
        const ids = b.product_ids ?? [];
        return { ...b, product_ids: ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId] };
      }),
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('landingPages')}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus size={16} /> {t('addNew')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/50">
        {landingPages.map((p) => (
          <div key={p.slug} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0">
              {p.hero_image && <img src={p.hero_image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="text-xs text-gray-500">/{p.slug}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {p.active ? t('active') : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(p)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {landingPages.length === 0 && <p className="p-8 text-center text-gray-500">No landing pages yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t('edit') : t('addNew')}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-1">
              <ImageUpload value={form.hero_image ?? null} onChange={(url) => setForm((f) => ({ ...f, hero_image: url }))} folder="landing" label={t('landingHeroImage')} aspect="aspect-video" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">{t('title')} *</label><input type="text" value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('slug')}</label><input type="text" value={form.slug ?? ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('startDate')}</label><input type="date" value={form.starts_at ? form.starts_at.slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value || null }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('endDate')}</label><input type="date" value={form.ends_at ? form.ends_at.slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value || null }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.active ?? false} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded" /> {t('active')}</label>

              {/* Content blocks */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">{t('contentBlocks')}</label>
                  <div className="flex gap-1 flex-wrap">
                    {(['heading', 'paragraph', 'image', 'banner', 'products'] as const).map((bt) => (
                      <button key={bt} type="button" onClick={() => addBlock(bt)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30">
                        {t(bt)} +
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {(form.content_blocks ?? []).map((block, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{t(block.type)}</span>
                        <button type="button" onClick={() => removeBlock(idx)} className="text-red-500"><X size={14} /></button>
                      </div>
                      {(block.type === 'heading' || block.type === 'paragraph') && (
                        <input type="text" value={block.text ?? ''} onChange={(e) => updateBlock(idx, { text: e.target.value })} placeholder={t('text')} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                      )}
                      {(block.type === 'image' || block.type === 'banner') && (
                        <>
                          <ImageUpload value={block.image ?? null} onChange={(url) => updateBlock(idx, { image: url })} folder="landing-content" label={t('image')} />
                          {block.type === 'banner' && (
                            <input type="text" value={block.text ?? ''} onChange={(e) => updateBlock(idx, { text: e.target.value })} placeholder={t('text')} className="w-full px-3 py-2 mt-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                          )}
                        </>
                      )}
                      {block.type === 'products' && (
                        <div>
                          <input type="text" value={block.text ?? ''} onChange={(e) => updateBlock(idx, { text: e.target.value })} placeholder="Section title (optional)" className="w-full px-3 py-2 mb-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" />
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {products.map((p) => (
                              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={(block.product_ids ?? []).includes(p.id)} onChange={() => toggleProductInBlock(idx, p.id)} className="w-4 h-4 rounded" />
                                <span>{p.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
