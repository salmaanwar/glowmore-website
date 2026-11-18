// Renders a Figma screen spec as HTML. Auto layout -> flexbox, variables -> CSS custom properties,
// text styles -> .ts-* classes (src/styles/tokens.css), vector art -> /gfx/*.svg, image fills -> /img/*.
import React, { createContext, useContext } from 'react';
import type { Num, Paint, SpecNode, Effect } from './types';
import map from '../styles/varmap.json';
import imgIndex from '../styles/imgindex.json';

const VARS = map.vars as Record<string, string>;
const TEXT = map.text as Record<string, string>;
const FX = map.fx as Record<string, string>;
const VALS = (map as any).vals as Record<string, string>;
const IMGS = imgIndex as Record<string, string>;
const BASE = import.meta.env.BASE_URL;

export interface Behavior { onClick?: (e: React.MouseEvent) => void; onMouseEnter?: () => void; text?: string; hidden?: boolean; className?: string; render?: React.ReactNode }
export type Resolve = (node: SpecNode, path: SpecNode[]) => Behavior | undefined;
export const BehaviorCtx = createContext<Resolve>(() => undefined);
/* Viewport screens (sign in, overlays): the root takes the window height (vh, in design px). H is the Figma frame height. */
export const ViewportCtx = createContext<{ H: number; vh: number } | null>(null);

const px = (v: Num | undefined): string | undefined => {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) { const css = VARS[v[0]]; return css ? `var(${css}, ${v[1]}px)` : `${v[1]}px`; }
  return `${v}px`;
};
const colour = (p: Paint) => {
  // token when Figma showed its Light value; the exact colour when the frame used another mode (e.g. the Teal footer)
  const sameAsLight = p.c && VARS[p.c] && p.h && VALS[p.c] && VALS[p.c].slice(0, 7) === p.h.toUpperCase();
  const base = sameAsLight ? `var(${VARS[p.c!]}, ${p.h})` : p.h || 'transparent';
  return p.o !== undefined && p.o < 1 ? `color-mix(in srgb, ${base} ${Math.round(p.o * 100)}%, transparent)` : base;
};
export const imgUrl = (hash: string) => `${BASE}img/${IMGS[hash] || hash + '.png'}`;
const gradientDir = (tr?: number[][]) => {
  if (!tr) return 'to right';
  const [a, b] = tr[0];
  if (Math.abs(a) >= Math.abs(b)) return a >= 0 ? 'to right' : 'to left';
  return b >= 0 ? 'to bottom' : 'to top';
};

// Background layers (Figma lists the bottom paint first; CSS lists the top layer first).
function backgrounds(fills: Paint[] | undefined, w: number, h: number): React.CSSProperties {
  if (!fills || !fills.length) return {};
  const layers: string[] = []; const sizes: string[] = []; const pos: string[] = []; const reps: string[] = [];
  for (const p of [...fills].reverse()) {
    if (p.img) {
      layers.push(`url("${imgUrl(p.img)}")`);
      if (p.m === 'FIT') { sizes.push('contain'); pos.push('center'); reps.push('no-repeat'); }
      else if (p.m === 'TILE') { sizes.push(p.sf ? `${Math.round(p.sf * 100)}%` : 'auto'); pos.push('0 0'); reps.push('repeat'); }
      else if (p.m === 'CROP' && p.t) {
        // imageTransform maps the frame into image space: scale = 1/t[0][0], offset = t[0][2]
        const sx = p.t[0][0] || 1, sy = p.t[1][1] || 1;
        const bw = w / sx, bh = h / sy;
        sizes.push(`${bw}px ${bh}px`); pos.push(`${-p.t[0][2] * bw}px ${-p.t[1][2] * bh}px`); reps.push('no-repeat');
      } else { sizes.push('cover'); pos.push('center'); reps.push('no-repeat'); }
    } else if (p.lg) {
      const stops = p.lg.map(([hx, a, at]) => `${hexA(hx, a)} ${Math.round(at * 100)}%`).join(', ');
      layers.push(`linear-gradient(${gradientDir(p.tr)}, ${stops})`); sizes.push('100% 100%'); pos.push('0 0'); reps.push('no-repeat');
    } else {
      const c = colour(p); layers.push(`linear-gradient(${c}, ${c})`); sizes.push('100% 100%'); pos.push('0 0'); reps.push('no-repeat');
    }
  }
  return { backgroundImage: layers.join(', '), backgroundSize: sizes.join(', '), backgroundPosition: pos.join(', '), backgroundRepeat: reps.join(', ') };
}
const hexA = (hx: string, a: number) => { const n = parseInt(hx.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

function shadows(n: SpecNode): string | undefined {
  const out: string[] = [];
  if (n.fx && FX[n.fx]) out.push(`var(${FX[n.fx]})`);
  if (n.fxr) for (const e of n.fxr as Effect[]) if (e.c && (e.t === 'DROP_SHADOW' || e.t === 'INNER_SHADOW')) out.push(`${e.t === 'INNER_SHADOW' ? 'inset ' : ''}${e.x || 0}px ${e.y || 0}px ${e.b || 0}px ${e.s || 0}px ${hexA(e.c[0], e.c[1])}`);
  // strokes drawn as inset shadows so they never change the layout (Figma inside strokes)
  if (n.b && n.b.length && n.bw) {
    const col = colour(n.b[n.b.length - 1]);
    const [t, r, b, l] = Array.isArray(n.bw) ? n.bw : [n.bw, n.bw, n.bw, n.bw];
    if (t === r && r === b && b === l) { if (t) out.push(n.ba === 'O' ? `0 0 0 ${t}px ${col}` : `inset 0 0 0 ${t}px ${col}`); }
    else { if (t) out.push(`inset 0 ${t}px 0 0 ${col}`); if (b) out.push(`inset 0 -${b}px 0 0 ${col}`); if (l) out.push(`inset ${l}px 0 0 0 ${col}`); if (r) out.push(`inset -${r}px 0 0 0 ${col}`); }
  }
  return out.length ? out.join(', ') : undefined;
}

const JUSTIFY: Record<string, string> = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
const ALIGN: Record<string, string> = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };

// Size of a child inside its auto-layout parent. Fill is recovered from grow (main axis) and st (cross axis).
function childSize(n: SpecNode, dir: 'r' | 'c' | null): React.CSSProperties {
  const s: React.CSSProperties = {};
  const isText = n.t === 'T';
  if (!dir) { s.width = n.w; s.height = n.h; return s; }
  const [hz, vt] = (n.sz || 'FF').split('');
  const mainFill = !!n.grow, crossFill = !!n.st;
  const hFill = dir === 'r' ? mainFill : crossFill;
  const vFill = dir === 'c' ? mainFill : crossFill;
  if (hFill) { if (dir === 'r') { s.flex = '1 1 0'; s.minWidth = 0; } else s.alignSelf = 'stretch'; }
  else if (hz === 'H' || (isText && n.ar === 'WIDTH_AND_HEIGHT')) s.width = 'max-content';
  else s.width = n.w;
  if (vFill) { if (dir === 'c') { s.flex = '1 1 0'; s.minHeight = 0; } else s.alignSelf = 'stretch'; }
  else if (vt === 'H' || (isText && n.ar !== 'NONE' && n.ar !== 'TRUNCATE')) s.height = undefined;
  else s.height = n.h;
  if (!hFill && dir === 'r') s.flexShrink = 0;
  if (!vFill && dir === 'c') s.flexShrink = 0;
  if (n.minW) s.minWidth = n.minW; if (n.maxW) s.maxWidth = n.maxW;
  return s;
}

function TextNode({ n, style, b }: { n: SpecNode; style: React.CSSProperties; b?: Behavior }) {
  const cls = (n.s && TEXT[n.s]) || '';
  const fillCol = (f?: Paint[]) => (f && f.length ? colour(f[f.length - 1]) : undefined);
  const css: React.CSSProperties = { ...style, whiteSpace: n.ar === 'WIDTH_AND_HEIGHT' ? 'pre' : 'pre-wrap', textAlign: n.al === 'C' ? 'center' : n.al === 'R' ? 'right' : n.al === 'J' ? 'justify' : 'left', color: fillCol(n.f as Paint[] | undefined), overflowWrap: 'break-word' };
  if (!cls && n.fs) css.fontSize = n.fs;
  if (n.dec === 'UNDERLINE') css.textDecoration = 'underline'; if (n.dec === 'STRIKETHROUGH') css.textDecoration = 'line-through';
  if (n.tc === 'UPPER') css.textTransform = 'uppercase';
  if (n.trunc) { css.overflow = 'hidden'; css.textOverflow = 'ellipsis'; css.display = '-webkit-box'; (css as any).WebkitLineClamp = n.trunc; (css as any).WebkitBoxOrient = 'vertical'; css.whiteSpace = 'normal'; }
  if (n.va === 'C') { css.display = 'flex'; css.alignItems = 'center'; css.justifyContent = n.al === 'C' ? 'center' : n.al === 'R' ? 'flex-end' : 'flex-start'; }
  const content = b?.text !== undefined ? b.text : n.seg ? n.seg.map((s, i) => {
    const sc: React.CSSProperties = { color: fillCol(s.f) };
    if (s.dec === 'UNDERLINE') sc.textDecoration = 'underline'; if (s.dec === 'STRIKETHROUGH') sc.textDecoration = 'line-through';
    return <span key={i} className={(s.s && TEXT[s.s]) || ''} style={sc}>{s.x}</span>;
  }) : n.txt;
  return <div className={cls} style={css} data-name={n.n}>{content}</div>;
}

export function Node({ n, dir, path }: { n: SpecNode; dir: 'r' | 'c' | null; path: SpecNode[] }) {
  const resolve = useContext(BehaviorCtx);
  const b = resolve(n, path);
  if (b?.hidden) return null;
  const vp = useContext(ViewportCtx);
  const abs = !!n.abs && path.length > 0;
  const style: React.CSSProperties = abs ? { position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h } : childSize(n, dir);
  if (vp && path.length === 0) { style.height = vp.vh; style.overflow = 'hidden'; }
  if (vp && path.length === 1 && !abs) style.zIndex = 1;                       /* content above bottom art */
  if (vp && dir === 'c' && n.grow && n.t !== 'T') style.overflowY = 'auto';    /* growing areas (drawer lists) scroll when the window is short */
  if (vp && abs && n.y !== undefined) {
    const d = vp.vh - vp.H;
    if (Math.abs(n.h - vp.H) < 1 && Math.abs(n.y) < 1) { style.height = vp.vh; if (path.length === 1) style.zIndex = 2; } /* full-height overlay / drawer: stretch, above the page */
    else if ((path.length === 1 || Math.abs(path[path.length - 1].h - vp.H) < 1) && Math.abs(n.y + n.h / 2 - vp.H / 2) < 60) { style.top = n.y + d / 2; style.zIndex = 2; } /* centred dialog (also inside a full-height overlay) */
    else if (path.length === 1 && n.h < vp.H && n.y + n.h / 2 > vp.H * 0.6) { style.top = n.y + d; style.zIndex = 0; } /* bottom art (sparkles, fade), behind the content */
  }
  if (n.rot) { style.transform = `rotate(${-n.rot}deg)`; style.transformOrigin = '0 0'; }
  if (n.op !== undefined) style.opacity = n.op;
  if (b?.onClick) style.cursor = 'pointer';
  const events = { onClick: b?.onClick, onMouseEnter: b?.onMouseEnter };
  if (b?.render) return <div style={style} data-name={n.n} {...events}>{b.render}</div>;

  if (n.t === 'T') return <TextNode n={n} style={style} b={b} />;
  /* vector art: Figma crops SVG exports to what is visible on the screen, so use the file's own size */
  if (n.t === 'G') return <img src={`${BASE}gfx/${n.g}.svg`} alt="" draggable={false} style={{ ...style, display: 'block', width: 'auto', height: 'auto', maxWidth: 'none' }} data-name={n.n} {...events} className={b?.className} />;

  Object.assign(style, backgrounds(n.f, n.w, n.h));
  const sh = shadows(n); if (sh) style.boxShadow = sh;
  if (n.r !== undefined) style.borderRadius = Array.isArray(n.r) && typeof n.r[0] === 'string' ? px(n.r as [string, number]) : Array.isArray(n.r) ? (n.r as number[]).map(v => v + 'px').join(' ') : n.r as number;
  if (n.clip) style.overflow = 'hidden';
  style.position = style.position || 'relative';
  style.boxSizing = 'border-box';
  let childDir: 'r' | 'c' | null = null;
  if (n.L) {
    childDir = n.L.d;
    style.display = 'flex'; style.flexDirection = n.L.d === 'r' ? 'row' : 'column';
    style.gap = n.L.a === 'SPACE_BETWEEN' ? undefined : px(n.L.g);
    style.padding = n.L.p.map(px).join(' ');
    style.justifyContent = JUSTIFY[n.L.a] || 'flex-start';
    style.alignItems = ALIGN[n.L.ca] || 'flex-start';
    if (n.L.wrap !== undefined) { style.flexWrap = 'wrap'; style.rowGap = px(n.L.wrap); style.columnGap = px(n.L.g); }
  }
  const kids = (n.k || []).map((k, i) => <Node key={i} n={k} dir={k.abs ? null : childDir} path={[...path, n]} />);
  return <div style={style} data-name={n.n} data-c={n.c} className={b?.className} {...events}>{kids}</div>;
}

export function Screen({ spec }: { spec: SpecNode }) {
  const root: SpecNode = { ...spec };
  return <Node n={root} dir={null} path={[]} />;
}
