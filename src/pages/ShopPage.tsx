import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { useI18n } from '@/i18n/I18nContext';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { formatPrice } from '@/config/site';

export function ShopPage() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') ?? '');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setSelectedCategory(searchParams.get('category') ?? '');
    setSelectedBrand(searchParams.get('brand') ?? '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.short_description ?? '').toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }
    if (selectedAvailability) {
      result = result.filter((p) => p.availability === selectedAvailability);
    }
    if (minPrice) {
      result = result.filter((p) => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    switch (sortBy) {
      case 'priceLowHigh':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'priceHighLow':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, search, selectedCategory, selectedBrand, selectedAvailability, minPrice, maxPrice, sortBy]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t('category')}</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            updateParam('category', e.target.value);
          }}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
        >
          <option value="">{t('allCategories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t('brand')}</label>
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            updateParam('brand', e.target.value);
          }}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
        >
          <option value="">{t('allBrands')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t('availability')}</label>
        <select
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
        >
          <option value="">{t('allAvailability')}</option>
          <option value="in-stock">{t('inStock')}</option>
          <option value="out-of-stock">{t('outOfStock')}</option>
          <option value="pre-order">{t('preOrder')}</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t('priceRange')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">All prices in {formatPrice(0).replace('0', '')}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{t('shop')}</h1>
        <div className="relative md:hidden">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full ps-10 pe-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative hidden md:block">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full ps-10 pe-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal size={18} />
              {t('filters')}
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
            >
              <SlidersHorizontal size={16} />
              {t('filters')}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              {filtered.length} {t('results')}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
            >
              <option value="newest">{t('newest')}</option>
              <option value="priceLowHigh">{t('priceLowHigh')}</option>
              <option value="priceHighLow">{t('priceHighLow')}</option>
            </select>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  {t('filters')}
                </h2>
                <button onClick={() => setShowFilters(false)}>
                  <X size={18} />
                </button>
              </div>
              <FilterContent />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <p className="text-lg">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
