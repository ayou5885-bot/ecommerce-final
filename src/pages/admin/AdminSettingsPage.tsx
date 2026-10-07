import { useState, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';
import { Upload, Loader2, Check } from 'lucide-react';

export function AdminSettingsPage() {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, 'favicon');
    if (url) {
      setFaviconUrl(url);
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (link) link.href = url;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 max-w-lg">
        <h2 className="font-bold text-lg mb-4">{t('favicon')}</h2>
        <div
          className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-center group"
          onClick={() => inputRef.current?.click()}
        >
          {faviconUrl ? (
            <img src={faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">
              {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('uploadFavicon')} (PNG/SVG, square)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/x-icon"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
        {saved && <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><Check size={14} /> {t('settingsSaved')}</p>}
      </div>
    </div>
  );
}
