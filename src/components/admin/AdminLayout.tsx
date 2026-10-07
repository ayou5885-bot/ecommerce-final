import { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  LayoutDashboard, Package, Tag, FolderTree, Boxes, Ticket, FileText,
  Settings, Users, LogOut, ShoppingCart, Store
} from 'lucide-react';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { staff, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = staff?.role === 'admin';

  const allNavItems = [
    { to: '/admin', label: t('dashboard'), icon: LayoutDashboard, adminOnly: true },
    { to: '/admin/orders', label: t('orders'), icon: ShoppingCart, adminOnly: false },
    { to: '/admin/products', label: t('products'), icon: Package, adminOnly: true },
    { to: '/admin/categories', label: t('categories'), icon: FolderTree, adminOnly: true },
    { to: '/admin/brands', label: t('brands'), icon: Tag, adminOnly: true },
    { to: '/admin/wilayas', label: t('wilayas'), icon: Boxes, adminOnly: true },
    { to: '/admin/coupons', label: t('coupons'), icon: Ticket, adminOnly: true },
    { to: '/admin/landing-pages', label: t('landingPages'), icon: FileText, adminOnly: true },
    { to: '/admin/settings', label: t('settings'), icon: Settings, adminOnly: true },
    { to: '/admin/staff', label: t('staff'), icon: Users, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 md:min-h-screen bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-e border-gray-200 dark:border-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{t('admin')}</p>
              <p className="text-xs text-gray-500">{staff?.email}</p>
            </div>
          </Link>
        </div>

        <nav className="p-2 md:overflow-y-auto md:flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
          <span className="text-sm text-gray-500">
            {staff?.display_name ?? staff?.email}
          </span>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
