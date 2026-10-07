export const siteConfig = {
  name: 'TechStore DZ',
  nameAr: 'متجر التقنية',
  tagline: 'Premium Tech, Delivered to Your Door',
  taglineAr: 'تقنية مميزة، تصل إلى باب منزلك',
  contact: {
    phone: '+213 555 00 00 00',
    email: 'contact@techstore.dz',
    address: 'Alger, Algeria',
    addressAr: 'الجزائر العاصمة، الجزائر',
  },
  social: {
    whatsapp: 'https://wa.me/213555000000',
    instagram: 'https://instagram.com/techstore.dz',
    facebook: 'https://facebook.com/techstore.dz',
  },
  currency: 'DZD',
  currencySymbol: 'DA',
  freeShippingThreshold: 50000,
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price) + ' DA';
}
