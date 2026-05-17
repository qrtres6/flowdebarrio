// Themes, theme hook and global style injection.
import { useState, useEffect } from 'react';

const THEME_KEY = 'tijera.theme.v1';

export const THEMES = {
  flow: {
    id: 'flow', name: 'Clásico', sub: 'Vintage gótico',
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
    logo: '/logo.svg',
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

export function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'flow'; } catch { return 'flow'; }
}

function saveTheme(id) {
  try { localStorage.setItem(THEME_KEY, id); } catch { /* ignore */ }
}

// Normalize a theme so legacy property names (gold) always exist.
export function withAliases(theme) {
  return { ...theme, gold: theme.gold || theme.accent };
}

export function useTheme() {
  const [themeId, setThemeId] = useState(loadTheme);
  useEffect(() => {
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
  const TH = withAliases(THEMES[themeId] || THEMES.flow);
  return [TH, setTheme, themeId];
}

export function ThemeStyle({ TH }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
      />
      <style>{`
        html, body, #root { background: ${TH.bg}; color: ${TH.text}; font-family: ${TH.fontBody || TH.font}; min-height: 100vh; }
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }
        ::selection { background: ${TH.accent}; color: ${TH.accentInk}; }
        input, button, select { font-family: inherit; }
        a { color: inherit; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: ${TH.surface3}; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .th-title { font-family: ${TH.font}; ${TH.titleTransform ? `text-transform: ${TH.titleTransform};` : ''} letter-spacing: 0.02em; }
      `}</style>
    </>
  );
}
