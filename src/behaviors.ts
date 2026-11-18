// What each designed element does on the live site. Matched by DS component and its visible label,
// so the screens stay exactly as exported from Figma and only gain links and actions.
import type React from 'react';
import type { SpecNode } from './render/types';
import type { Behavior } from './render/Renderer';
import { MEGA } from './routes';

export const label = (n: SpecNode): string | null => {
  if (n.t === 'T') return n.txt || (n.seg ? n.seg.map(s => s.x).join('') : null);
  for (const k of n.k || []) { const t = label(k); if (t) return t; }
  return null;
};
const set = (n: SpecNode) => (n.c || '').split(' / ')[0];
const inside = (path: SpecNode[], test: (p: SpecNode) => boolean) => path.some(test);

// Button / link label -> route
const BUTTONS: [RegExp, string][] = [
  [/^Add to bag/, '/bag/added'], [/^Buy now$/, '/checkout'], [/^Checkout$/, '/checkout'], [/^View bag/, '/bag'],
  [/^Continue to payment$/, '/checkout/payment'], [/^Place order/, '/order/confirmed'], [/^(Try again|Pay again|Retry)/, '/checkout/payment'],
  [/^Add gift wrapping$/, '/bag/gift-wrap'], [/^Add gift wrap/, '/bag'],
  [/^Have an account\? Sign in$/, '/sign-in'], [/^Sign out/, '/sign-in'], [/^Join Glow Club$/, '/sign-in'],
  [/^(Shop now|Continue shopping|See trending items)$/, '/'], [/^Shop skincare$/, '/skincare'], [/^Shop all skincare$/, '/skincare'],
  [/^(Shop all deals|View all offers|View all|Serums & ampoules|Shop all.*)$/, '/serums'],
  [/^See all .* reviews$/, '/product/reviews'], [/^Buy again$/, '/bag'], [/^View order$/, '/track/delivered'],
  [/^Notify me$/, '/product'],
];
const BREADCRUMB: Record<string, string> = { 'Home': '/', 'Skincare': '/skincare', 'Serums & ampoules': '/serums', 'Bag': '/bag', 'Details': '/checkout', 'Payment': '/checkout/payment' };
const ACCOUNT_NAV: Record<string, string> = { 'Shop': '/', 'Orders': '/account/orders', 'Profile': '/account/profile' };

export function makeResolver(go: (to: string) => void, back: () => void, openMega: (file: string | null) => void, route: string) {
  return (n: SpecNode, path: SpecNode[]): Behavior | undefined => {
    const s = set(n);
    const click = (to: string) => ({ onClick: (e: React.MouseEvent) => { e.stopPropagation(); go(to); } });

    // logo -> home
    if (s === 'Logo' && inside(path, p => /Top Bar|Header/.test(p.c || p.n))) return click('/');

    // top navigation: hover opens the mega menu, click goes to the category
    if (s === 'Nav Item') {
      const l = label(n) || '';
      if (ACCOUNT_NAV[l] && route.startsWith('/account')) return click(ACCOUNT_NAV[l]);
      if (MEGA[l]) return { onMouseEnter: () => openMega(MEGA[l]), ...click(l === 'Skincare' ? '/skincare' : '/serums') };
      if (/Orders/.test(l)) return click('/account/orders'); if (/Profile/.test(l)) return click('/account/profile');
    }
    if (inside(path, p => set(p) === 'Top Bar')) {
      if (n.n === 'Bag') return click('/bag');
      if (n.n === 'Account') return click('/sign-in');
      if (n.n === 'Wishlist') return click('/account/orders');
    }
    if (s === 'Breadcrumb' || (s === 'Breadcrumb / Item')) { const l = label(n) || ''; if (BREADCRUMB[l]) return click(BREADCRUMB[l]); }

    if (s === 'Button' || s === 'Link Button' || s === 'Chip') {
      const l = label(n) || '';
      if (/^Track order$/.test(l)) return click(s === 'Link Button' ? '/track' : '/track/on-the-way');
      for (const [re, to] of BUTTONS) if (re.test(l)) return click(to);
      if (s === 'Link Button' && inside(path, p => set(p) === 'Mega Menu')) return click(l === 'Serums & ampoules' ? '/serums' : '/serums');
    }

    // product cards open the product page (their Add to bag button wins, handled above)
    if (s === 'Product Card') return click('/product');
    if (s === 'Category Tile') return click(label(n) === 'Skincare' ? '/skincare' : '/serums');
    if (s === 'Image Tile' || s === 'Brand Tile' || s === 'Brand Card') return click('/serums');
    if (s === 'Color Swatch' && route === '/product') return click('/product/shades');
    if (s === 'Order Card') return click('/track/on-the-way');

    // sign in: the email field and the code cells move the flow forward
    if (route === '/sign-in' && (s === 'Input' || s.startsWith('Input'))) return click('/sign-in/code');
    if (route === '/sign-in/code' && (s === 'OTP' || s.startsWith('OTP'))) return click('/account/orders');

    // overlays (mini bag, gift wrap, sold out): the dimmed page and close buttons go back
    if (n.n === 'Overlay' && path.length === 1) return { onClick: () => back() };
    if (s === 'Icon Button' && /Close/.test(JSON.stringify(n).slice(0, 400))) return { onClick: (e: React.MouseEvent) => { e.stopPropagation(); back(); } };
    return undefined;
  };
}
