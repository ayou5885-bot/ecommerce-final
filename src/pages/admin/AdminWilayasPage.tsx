import { useState } from 'react';
import { useWilayas } from '@/hooks/useWilayas';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

interface Edit {
  shipping_price?: number;
  desk_price?: number;
}

export function AdminWilayasPage() {
  const { wilayas, loading, refetch } = useWilayas();
  const { t } = useI18n();
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setHomePrice = (code: string, value: string) => {
    setEdits((prev) => ({ ...prev, [code]: { ...prev[code], shipping_price: Number(value) } }));
  };

  const setDeskPrice = (code: string, value: string) => {
    setEdits((prev) => ({ ...prev, [code]: { ...prev[code], desk_price: Number(value) } }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const [code, changes] of Object.entries(edits)) {
      await supabase.from('wilayas').update(changes).eq('code', code);
    }
    setEdits({});
    setSaving(false);
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('wilayas')}</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600">{t('settingsSaved')}</span>}
          <button
            onClick={handleSaveAll}
            disabled={Object.keys(edits).length === 0 || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium"
          >
            <Save size={16} /> {saving ? '...' : t('updateAll')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="p-3 text-start font-medium text-gray-500">{t('code')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('nameAr')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('nameFr')}</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('shippingPrice')} (DZD)</th>
              <th className="p-3 text-start font-medium text-gray-500">{t('deskPrice')} (DZD)</th>
            </tr>
          </thead>
          <tbody>
            {wilayas.map((w) => (
              <tr key={w.code} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="p-3 font-mono">{w.code}</td>
                <td className="p-3" dir="rtl">{w.name_ar}</td>
                <td className="p-3">{w.name_fr}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={edits[w.code]?.shipping_price ?? Number(w.shipping_price)}
                    onChange={(e) => setHomePrice(w.code, e.target.value)}
                    className="w-32 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={edits[w.code]?.desk_price ?? Number(w.desk_price)}
                    onChange={(e) => setDeskPrice(w.code, e.target.value)}
                    className="w-32 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
