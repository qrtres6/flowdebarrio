// web-shared.jsx — shared store, theme, formatters, icons for the web apps
// Persists to localStorage so admin + cobro stay in sync across tabs.

const STORE_KEY = 'tijera.store.v3';
const THEME_KEY = 'tijera.theme.v1';

// ─── Themes ───
const THEMES = {
  flow: {
    id: 'flow', name: 'Flow de Barrio', sub: 'Vintage gótico',
    font: "'Cinzel', 'Playfair Display', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    mono: "'Roboto Mono', monospace",
    bg: '#0A0807', surface: '#14110D', surface2: '#1E1A14', surface3: '#2A241B',
    line: '#3A3022', text: '#F5EDD8', textDim: '#B8A578', textMute: '#7A6B4F',
    accent: '#D4A857', accentInk: '#0A0807',
    accent2: '#1E5CB3', accent3: '#D63B3B',
    red: '#D63B3B', blue: '#1E5CB3', white: '#F5EDD8', gold: '#D4A857',
    green: '#7DBB6E',
    radius: 8, radiusSm: 6, radiusXs: 4, radiusPill: 999,
    logo: 'logo-v2.png',
    barberStripe: true,
    serifTitle: true,
    titleTransform: 'uppercase',
  },
  barberia: {
    id: 'barberia', name: 'Barbería oscura', sub: 'Negro & dorado',
    font: "'Inter', system-ui, sans-serif", mono: "'Roboto Mono', monospace",
    bg: '#0E0E10', surface: '#17171B', surface2: '#1F1F25', surface3: '#2A2A32',
    line: '#2E2E36', text: '#F4F1EA', textDim: '#9A958A', textMute: '#6B6760',
    accent: '#D4A857', accentInk: '#0E0E10',
    green: '#7DBB6E', red: '#C76A6A',
    radius: 16, radiusSm: 12, radiusXs: 10, radiusPill: 999,
  },
  neon: {
    id: 'neon', name: 'Cromo & neón', sub: 'Cyan tech',
    font: "'Space Grotesk', 'Inter', sans-serif", mono: "'JetBrains Mono', monospace",
    bg: '#08090C', surface: '#10131A', surface2: '#171B25', surface3: '#1F2330',
    line: '#262B38', text: '#E8ECF5', textDim: '#8A92A6', textMute: '#5A6173',
    accent: '#34E0D9', accentInk: '#08090C',
    green: '#7DE0A8', red: '#FF6B8B',
    radius: 6, radiusSm: 4, radiusXs: 3, radiusPill: 6,
    glow: '0 0 24px rgba(52,224,217,0.35)',
  },
  cafe: {
    id: 'cafe', name: 'Café & crema', sub: 'Boutique cálido',
    font: "'Cormorant Garamond', 'Georgia', serif", mono: "'IBM Plex Mono', monospace",
    bg: '#1F1612', surface: '#2A1F19', surface2: '#352720', surface3: '#403028',
    line: '#4A382F', text: '#F5EDE0', textDim: '#C5B5A0', textMute: '#8A7A68',
    accent: '#E0B584', accentInk: '#1F1612',
    green: '#A8C098', red: '#D88A7C',
    radius: 22, radiusSm: 18, radiusXs: 14, radiusPill: 999,
    serifTitle: true,
  },
  light: {
    id: 'light', name: 'Material claro', sub: 'Verde menta',
    font: "'Inter', system-ui, sans-serif", mono: "'Roboto Mono', monospace",
    bg: '#F4F1EC', surface: '#FFFFFF', surface2: '#F8F5F0', surface3: '#EFEAE2',
    line: '#E2DCD2', text: '#1B1A17', textDim: '#5C594F', textMute: '#8A8576',
    accent: '#1F7A6F', accentInk: '#FFFFFF',
    green: '#1F7A6F', red: '#C44B4B',
    radius: 24, radiusSm: 20, radiusXs: 14, radiusPill: 999,
  },
};

function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'flow'; } catch { return 'flow'; }
}
function saveTheme(id) {
  try { localStorage.setItem(THEME_KEY, id); } catch {}
}

function useTheme() {
  const [themeId, setThemeId] = React.useState(loadTheme);
  React.useEffect(() => {
    function onStorage(e) {
      if (e.key === THEME_KEY && e.newValue) setThemeId(e.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  function setTheme(id) {
    saveTheme(id);
    setThemeId(id);
  }
  const TH = THEMES[themeId] || THEMES.flow;
  return [TH, setTheme, themeId];
}

function ThemeStyle({ TH }) {
  // Inject Google fonts + global body bg
  return (
    <React.Fragment>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"/>
      <style>{`
        html, body, #root { background: ${TH.bg}; color: ${TH.text}; font-family: ${TH.fontBody || TH.font}; min-height: 100vh; }
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }
        ::selection { background: ${TH.accent}; color: ${TH.accentInk}; }
        input, button, select { font-family: inherit; }
        a { color: inherit; }
        /* Scrollbar */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: ${TH.surface3}; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
        /* Title font for headings when theme has serifTitle */
        .th-title { font-family: ${TH.font}; ${TH.titleTransform ? `text-transform: ${TH.titleTransform};` : ''} letter-spacing: 0.02em; }
      `}</style>
    </React.Fragment>
  );
}


const DEFAULT_STATE = {
  shopName: 'Flow de Barrio',
  adminPassword: 'flow2026',
  services: [
    { id: 's1', name: 'Corte clásico',    price: 6000,  icon: 'scissors' },
    { id: 's2', name: 'Barba',            price: 4500,  icon: 'razor' },
    { id: 's3', name: 'Corte + Barba',    price: 9500,  icon: 'combo' },
    { id: 's4', name: 'Tinte',            price: 12000, icon: 'tint' },
    { id: 's5', name: 'Lavado',           price: 2500,  icon: 'wash' },
    { id: 's6', name: 'Diseño',           price: 3500,  icon: 'design' },
    { id: 's7', name: 'Cejas',            price: 2000,  icon: 'brow' },
    { id: 's8', name: 'Corte niño',       price: 5000,  icon: 'kid' },
  ],
  employees: [
    { id: 'e1', name: 'Mateo Ramírez',  role: 'Barbero senior',  active: true,  startDate: '2023-04-12', color: '#B8893E', commissionPct: 50 },
    { id: 'e2', name: 'Lucas Vidal',    role: 'Barbero',         active: true,  startDate: '2024-02-03', color: '#6E8E63', commissionPct: 45 },
    { id: 'e3', name: 'Diego Ferraro',  role: 'Barbero',         active: true,  startDate: '2024-08-19', color: '#8B5E3C', commissionPct: 50 },
    { id: 'e4', name: 'Sofía Bianchi',  role: 'Estilista',       active: false, startDate: '2025-01-08', color: '#A56CB8', commissionPct: 55 },
  ],
  approvalCode: '4827',
  // Currently open shifts (one per active employee at most)
  openShifts: {}, // empId -> { id, empId, startTime: ISO, entries: [{id, svcId, name, icon, price, method, t}] }
  // Closed shifts history
  shifts: [], // { id, empId, empName, commissionPct, startTime, endTime, entries, total, empCut, shopCut }
  expenses: [], // { id, category, amount, date, note }
  expenseCategories: ['Alquiler', 'Servicios', 'Insumos', 'Otros'],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch { return DEFAULT_STATE; }
}
function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
}

// Hook: shared store with cross-tab sync
function useStore() {
  const [state, setStateRaw] = React.useState(loadState);
  React.useEffect(() => {
    function onStorage(e) {
      if (e.key === STORE_KEY && e.newValue) {
        try { setStateRaw(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  function setState(updater) {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }
  return [state, setState];
}

function fmt(n) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('es-AR');
}

const ICON_OPTIONS = [
  'scissors','razor','combo','tint','wash','design','brow','kid','sparkle','beard','massage','flame'
];

function Icon({ name, size = 24, color = 'currentColor' }) {
  const s = { width: size, height: size, display: 'block' };
  const stroke = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'scissors': return (<svg viewBox="0 0 32 32" style={s}><circle cx="8" cy="9" r="3.2" {...stroke}/><circle cx="8" cy="23" r="3.2" {...stroke}/><path d="M10.5 11l16 11M10.5 21l16-11" {...stroke}/></svg>);
    case 'razor':    return (<svg viewBox="0 0 32 32" style={s}><path d="M22 4l6 6-12 12-6-6L22 4z" {...stroke}/><path d="M10 16l-6 12 12-6" {...stroke}/></svg>);
    case 'combo':    return (<svg viewBox="0 0 32 32" style={s}><circle cx="7" cy="10" r="2.6" {...stroke}/><circle cx="7" cy="22" r="2.6" {...stroke}/><path d="M9 11l16 10M9 21l16-10" {...stroke}/><path d="M22 6l3 3-3 3" {...stroke}/></svg>);
    case 'tint':     return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4c5 7 9 12 9 17a9 9 0 1 1-18 0c0-5 4-10 9-17z" {...stroke}/></svg>);
    case 'wash':     return (<svg viewBox="0 0 32 32" style={s}><path d="M5 14h22v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-8z" {...stroke}/><path d="M9 14V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6" {...stroke}/><path d="M11 18v3M16 18v3M21 18v3" {...stroke}/></svg>);
    case 'design':   return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27c4-2 6-6 7-10s4-9 9-11c4-2 6 0 5 4-1 5-6 8-10 9s-8 4-11 8z" {...stroke}/></svg>);
    case 'brow':     return (<svg viewBox="0 0 32 32" style={s}><path d="M4 18c4-6 10-8 14-8s8 1 10 3" {...stroke}/><path d="M7 14l-1 4M12 11l-1 5M18 11l1 5M24 13l2 4" {...stroke}/></svg>);
    case 'kid':      return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="14" r="6" {...stroke}/><path d="M10 12c2-4 10-4 12 0" {...stroke}/><path d="M6 28c2-4 6-6 10-6s8 2 10 6" {...stroke}/></svg>);
    case 'sparkle':  return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" {...stroke}/></svg>);
    case 'beard':    return (<svg viewBox="0 0 32 32" style={s}><path d="M8 8c0 0 2 2 8 2s8-2 8-2v8c0 6-4 11-8 11s-8-5-8-11V8z" {...stroke}/><path d="M12 16c1 1 2 2 4 2s3-1 4-2" {...stroke}/></svg>);
    case 'massage':  return (<svg viewBox="0 0 32 32" style={s}><path d="M5 22c0-6 5-10 11-10s11 4 11 10" {...stroke}/><path d="M10 22v-2M16 22v-3M22 22v-2" {...stroke}/></svg>);
    case 'flame':    return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4c-2 6-8 8-8 14a8 8 0 0 0 16 0c0-3-2-5-2-8 0 0-3 2-3-2 0-2-3-3-3-4z" {...stroke}/></svg>);
    case 'plus':     return (<svg viewBox="0 0 32 32" style={s}><path d="M16 6v20M6 16h20" {...stroke}/></svg>);
    case 'check':    return (<svg viewBox="0 0 32 32" style={s}><path d="M6 17l6 6 14-14" {...stroke}/></svg>);
    case 'close':    return (<svg viewBox="0 0 32 32" style={s}><path d="M7 7l18 18M25 7L7 25" {...stroke}/></svg>);
    case 'edit':     return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27l3-1L23 11l-2-2L6 24l-1 3z" {...stroke}/><path d="M21 9l3 3" {...stroke}/></svg>);
    case 'trash':    return (<svg viewBox="0 0 32 32" style={s}><path d="M6 9h20M12 9V6h8v3M9 9l1 18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-18" {...stroke}/></svg>);
    case 'user':     return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="11" r="5" {...stroke}/><path d="M5 28c2-5 6-8 11-8s9 3 11 8" {...stroke}/></svg>);
    case 'chart':    return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27V5M5 27h22" {...stroke}/><path d="M9 22v-6M14 22v-12M19 22v-8M24 22v-14" {...stroke}/></svg>);
    case 'gear':     return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="16" r="3.5" {...stroke}/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" {...stroke}/></svg>);
    case 'home':     return (<svg viewBox="0 0 32 32" style={s}><path d="M5 15l11-9 11 9v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V15z" {...stroke}/><path d="M13 29v-9h6v9" {...stroke}/></svg>);
    case 'cash':     return (<svg viewBox="0 0 32 32" style={s}><rect x="4" y="9" width="24" height="14" rx="1.5" {...stroke}/><circle cx="16" cy="16" r="3.5" {...stroke}/></svg>);
    case 'card':     return (<svg viewBox="0 0 32 32" style={s}><rect x="3" y="8" width="26" height="16" rx="2" {...stroke}/><path d="M3 13h26M7 19h5" {...stroke}/></svg>);
    case 'qr':       return (<svg viewBox="0 0 32 32" style={s}><rect x="5" y="5" width="9" height="9" {...stroke}/><rect x="18" y="5" width="9" height="9" {...stroke}/><rect x="5" y="18" width="9" height="9" {...stroke}/><path d="M18 18h3v3M27 18v3h-3M18 24h3v3M24 24h3v3" {...stroke}/></svg>);
    case 'transfer':return (<svg viewBox="0 0 32 32" style={s}><path d="M5 11h20l-5-5M27 21H7l5 5" {...stroke}/></svg>);
    case 'lock':     return (<svg viewBox="0 0 32 32" style={s}><rect x="7" y="14" width="18" height="14" rx="2" {...stroke}/><path d="M11 14V9a5 5 0 0 1 10 0v5" {...stroke}/></svg>);
    case 'logout':   return (<svg viewBox="0 0 32 32" style={s}><path d="M14 6H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" {...stroke}/><path d="M20 11l5 5-5 5M11 16h14" {...stroke}/></svg>);
    case 'arrow-r':  return (<svg viewBox="0 0 32 32" style={s}><path d="M6 16h20M20 8l8 8-8 8" {...stroke}/></svg>);
    case 'arrow-l':  return (<svg viewBox="0 0 32 32" style={s}><path d="M26 16H6M12 8l-8 8 8 8" {...stroke}/></svg>);
    case 'logo':     return (<svg viewBox="0 0 32 32" style={s}><circle cx="10" cy="11" r="4" {...stroke}/><circle cx="10" cy="22" r="4" {...stroke}/><path d="M13 13l16 8M13 20l16-8" {...stroke}/></svg>);
    default: return null;
  }
}

const PAY_METHODS = [
  { id: 'cash',     name: 'Efectivo',      icon: 'cash' },
  { id: 'card',     name: 'Tarjeta',       icon: 'card' },
  { id: 'transfer', name: 'Transferencia', icon: 'transfer' },
  { id: 'qr',       name: 'QR / MP',       icon: 'qr' },
];

function initials(name) {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

function uid(prefix = 'x') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

Object.assign(window, {
  useStore, fmt, Icon, ICON_OPTIONS, PAY_METHODS, initials, uid, DEFAULT_STATE,
  THEMES, useTheme, ThemeStyle,
});
