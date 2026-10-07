import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/i18n/I18nContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { StoreLayout } from '@/components/StoreLayout';

// Storefront pages
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { LandingPageView } from '@/pages/LandingPageView';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminBrandsPage } from '@/pages/admin/AdminBrandsPage';
import { AdminWilayasPage } from '@/pages/admin/AdminWilayasPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminLandingPagesPage } from '@/pages/admin/AdminLandingPagesPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminStaffPage } from '@/pages/admin/AdminStaffPage';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Storefront */}
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/track" element={<TrackOrderPage />} />
                  <Route path="/l/:slug" element={<LandingPageView />} />
                </Route>

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminDashboardPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute>
                      <AdminLayout><AdminOrdersPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminProductsPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminCategoriesPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/brands"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminBrandsPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/wilayas"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminWilayasPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminCouponsPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/landing-pages"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminLandingPagesPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminSettingsPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout><AdminStaffPage /></AdminLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
