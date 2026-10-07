import { Link } from 'react-router-dom';
import { MessageCircle, Instagram, Facebook, Mail, Phone, MapPin, Package } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { siteConfig } from '@/config/site';

export function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {lang === 'ar' ? siteConfig.nameAr : siteConfig.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? siteConfig.taglineAr : siteConfig.tagline}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('contactUs')}</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0" />
                <span>{lang === 'ar' ? siteConfig.contact.addressAr : siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('followUs')}</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
              >
                <MessageCircle size={18} />
                <span>{t('whatsapp')}</span>
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 hover:opacity-90 text-white text-sm font-medium transition-opacity"
              >
                <Instagram size={18} />
                <span>{t('instagram')}</span>
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Facebook size={18} />
                <span>{t('facebook')}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {year} {lang === 'ar' ? siteConfig.nameAr : siteConfig.name}. {t('rights')}
          </p>
          <Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {t('admin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
