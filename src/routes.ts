// Route -> Figma screen (src/screens/<file>.json). One entry per Desktop screen in the Glowmore Website file.
export const ROUTES: Record<string, { file: string; title: string }> = {
  '/': { file: 'home', title: 'Home' },
  '/skincare': { file: 'skincare', title: 'Skincare' },
  '/serums': { file: 'serums', title: 'Serums & ampoules' },
  '/serums/no-results': { file: 'serums-empty', title: 'No results' },
  '/product': { file: 'product', title: 'Dark Spot Correcting Glow Serum' },
  '/product/shades': { file: 'product-shades', title: 'Lip Oil' },
  '/product/sold-out': { file: 'product-soldout', title: 'Sold out' },
  '/product/reviews': { file: 'reviews', title: 'Reviews' },
  '/bag/added': { file: 'minicart', title: 'Added to bag' },
  '/bag': { file: 'cart', title: 'Your bag' },
  '/bag/empty': { file: 'cart-empty', title: 'Your bag' },
  '/bag/sticker': { file: 'cart-won', title: 'Your bag' },
  '/bag/gift-wrap': { file: 'giftwrap', title: 'Gift wrap' },
  '/checkout': { file: 'checkout-details', title: 'Checkout' },
  '/checkout/payment': { file: 'checkout-payment', title: 'Payment' },
  '/checkout/payment-failed': { file: 'payment-failed', title: 'Payment failed' },
  '/order/confirmed': { file: 'order-confirmed', title: 'Order confirmed' },
  '/track': { file: 'track', title: 'Track my order' },
  '/track/on-the-way': { file: 'status-ontheway', title: 'Order status' },
  '/track/delivered': { file: 'status-delivered', title: 'Order status' },
  '/sign-in': { file: 'signin', title: 'Sign in' },
  '/sign-in/code': { file: 'signin-code', title: 'Enter code' },
  '/account/orders': { file: 'account-orders', title: 'Orders' },
  '/account/profile': { file: 'account-profile', title: 'Profile' },
};

// Top navigation item -> mega menu screen.
export const MEGA: Record<string, string> = {
  'Offers': 'mega-offers', 'Skincare': 'mega-skincare', 'Makeup': 'mega-makeup', 'Hair': 'mega-hair', 'Fragrance': 'mega-fragrance',
  'Body & Wellbeing': 'mega-body', 'K-Beauty': 'mega-kbeauty', 'New & Trending': 'mega-new', 'Brands': 'mega-brands', 'Gifts & Sets': 'mega-gifts', 'Shop by': 'mega-shopby',
};
