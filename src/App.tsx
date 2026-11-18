import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BehaviorCtx, Node, Screen } from './render/Renderer';
import type { SpecNode } from './render/types';
import { ROUTES } from './routes';
import { makeResolver } from './behaviors';

const loaders = import.meta.glob<{ default: SpecNode }>('./screens/*.json');
const cache: Record<string, SpecNode> = {};
async function load(file: string) {
  if (cache[file]) return cache[file];
  const mod = await loaders[`./screens/${file}.json`]();
  return (cache[file] = mod.default);
}

// The mega menu panel inside a "Home - Mega menu (…)" screen.
const findMega = (n: SpecNode): SpecNode | null => {
  if ((n.c || '').startsWith('Mega Menu')) return n;
  for (const k of n.k || []) { const m = findMega(k); if (m) return m; }
  return null;
};

export default function App() {
  const loc = useLocation();
  const nav = useNavigate();
  const route = ROUTES[loc.pathname] ? loc.pathname : '/';
  const { file, title } = ROUTES[route];
  const [spec, setSpec] = useState<SpecNode | null>(cache[file] || null);
  const [mega, setMega] = useState<SpecNode | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => { let on = true; load(file).then(s => on && setSpec(s)); setMega(null); window.scrollTo(0, 0); document.title = `${title} · Glowmore`; return () => { on = false; }; }, [file, title]);
  useEffect(() => { const fit = () => setScale(Math.min(1, window.innerWidth / 1440)); fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);

  const resolver = useMemo(() => makeResolver(
    to => nav(to),
    () => (window.history.length > 1 ? nav(-1) : nav('/')),
    f => { if (!f) return setMega(null); load(f).then(s => setMega(findMega(s))); },
    route,
  ), [nav, route]);

  // the mega menu opens under the top bar of the current screen
  const menuTop = useMemo(() => { if (!spec?.k) return 0; let y = 0; for (const k of spec.k) { y += k.h; if ((k.c || '').startsWith('Top Bar')) return y; } return 0; }, [spec]);

  return (
    <BehaviorCtx.Provider value={resolver}>
      <div className="site" style={{ zoom: scale }}>
        {spec ? <Screen spec={spec} /> : <div style={{ height: '100vh' }} />}
        {mega && (
          <div className="mega" style={{ top: menuTop }} onMouseLeave={() => setMega(null)}>
            <Node n={{ ...mega, abs: undefined }} dir={null} path={[]} />
            <div className="mega-scrim" onMouseEnter={() => setMega(null)} />
          </div>
        )}
      </div>
    </BehaviorCtx.Provider>
  );
}
