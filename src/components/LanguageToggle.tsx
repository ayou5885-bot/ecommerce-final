import { useI18n } from '@/i18n/I18nContext';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium"
      aria-label="Toggle language"
    >
      <Languages size={18} />
      <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
    </button>
  );
}
