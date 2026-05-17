// Inline SVG icon set.

export function Icon({ name, size = 24, color = 'currentColor' }) {
  const s = { width: size, height: size, display: 'block' };
  const stroke = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'scissors': return (<svg viewBox="0 0 32 32" style={s}><circle cx="8" cy="9" r="3.2" {...stroke}/><circle cx="8" cy="23" r="3.2" {...stroke}/><path d="M10.5 11l16 11M10.5 21l16-11" {...stroke}/></svg>);
    case 'razor': return (<svg viewBox="0 0 32 32" style={s}><path d="M22 4l6 6-12 12-6-6L22 4z" {...stroke}/><path d="M10 16l-6 12 12-6" {...stroke}/></svg>);
    case 'combo': return (<svg viewBox="0 0 32 32" style={s}><circle cx="7" cy="10" r="2.6" {...stroke}/><circle cx="7" cy="22" r="2.6" {...stroke}/><path d="M9 11l16 10M9 21l16-10" {...stroke}/><path d="M22 6l3 3-3 3" {...stroke}/></svg>);
    case 'tint': return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4c5 7 9 12 9 17a9 9 0 1 1-18 0c0-5 4-10 9-17z" {...stroke}/></svg>);
    case 'wash': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 14h22v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-8z" {...stroke}/><path d="M9 14V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6" {...stroke}/><path d="M11 18v3M16 18v3M21 18v3" {...stroke}/></svg>);
    case 'design': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27c4-2 6-6 7-10s4-9 9-11c4-2 6 0 5 4-1 5-6 8-10 9s-8 4-11 8z" {...stroke}/></svg>);
    case 'brow': return (<svg viewBox="0 0 32 32" style={s}><path d="M4 18c4-6 10-8 14-8s8 1 10 3" {...stroke}/><path d="M7 14l-1 4M12 11l-1 5M18 11l1 5M24 13l2 4" {...stroke}/></svg>);
    case 'kid': return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="14" r="6" {...stroke}/><path d="M10 12c2-4 10-4 12 0" {...stroke}/><path d="M6 28c2-4 6-6 10-6s8 2 10 6" {...stroke}/></svg>);
    case 'sparkle': return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" {...stroke}/></svg>);
    case 'beard': return (<svg viewBox="0 0 32 32" style={s}><path d="M8 8c0 0 2 2 8 2s8-2 8-2v8c0 6-4 11-8 11s-8-5-8-11V8z" {...stroke}/><path d="M12 16c1 1 2 2 4 2s3-1 4-2" {...stroke}/></svg>);
    case 'massage': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 22c0-6 5-10 11-10s11 4 11 10" {...stroke}/><path d="M10 22v-2M16 22v-3M22 22v-2" {...stroke}/></svg>);
    case 'flame': return (<svg viewBox="0 0 32 32" style={s}><path d="M16 4c-2 6-8 8-8 14a8 8 0 0 0 16 0c0-3-2-5-2-8 0 0-3 2-3-2 0-2-3-3-3-4z" {...stroke}/></svg>);
    case 'plus': return (<svg viewBox="0 0 32 32" style={s}><path d="M16 6v20M6 16h20" {...stroke}/></svg>);
    case 'check': return (<svg viewBox="0 0 32 32" style={s}><path d="M6 17l6 6 14-14" {...stroke}/></svg>);
    case 'close': return (<svg viewBox="0 0 32 32" style={s}><path d="M7 7l18 18M25 7L7 25" {...stroke}/></svg>);
    case 'edit': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27l3-1L23 11l-2-2L6 24l-1 3z" {...stroke}/><path d="M21 9l3 3" {...stroke}/></svg>);
    case 'trash': return (<svg viewBox="0 0 32 32" style={s}><path d="M6 9h20M12 9V6h8v3M9 9l1 18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-18" {...stroke}/></svg>);
    case 'user': return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="11" r="5" {...stroke}/><path d="M5 28c2-5 6-8 11-8s9 3 11 8" {...stroke}/></svg>);
    case 'chart': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 27V5M5 27h22" {...stroke}/><path d="M9 22v-6M14 22v-12M19 22v-8M24 22v-14" {...stroke}/></svg>);
    case 'gear': return (<svg viewBox="0 0 32 32" style={s}><circle cx="16" cy="16" r="3.5" {...stroke}/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" {...stroke}/></svg>);
    case 'home': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 15l11-9 11 9v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V15z" {...stroke}/><path d="M13 29v-9h6v9" {...stroke}/></svg>);
    case 'cash': return (<svg viewBox="0 0 32 32" style={s}><rect x="4" y="9" width="24" height="14" rx="1.5" {...stroke}/><circle cx="16" cy="16" r="3.5" {...stroke}/></svg>);
    case 'card': return (<svg viewBox="0 0 32 32" style={s}><rect x="3" y="8" width="26" height="16" rx="2" {...stroke}/><path d="M3 13h26M7 19h5" {...stroke}/></svg>);
    case 'qr': return (<svg viewBox="0 0 32 32" style={s}><rect x="5" y="5" width="9" height="9" {...stroke}/><rect x="18" y="5" width="9" height="9" {...stroke}/><rect x="5" y="18" width="9" height="9" {...stroke}/><path d="M18 18h3v3M27 18v3h-3M18 24h3v3M24 24h3v3" {...stroke}/></svg>);
    case 'transfer': return (<svg viewBox="0 0 32 32" style={s}><path d="M5 11h20l-5-5M27 21H7l5 5" {...stroke}/></svg>);
    case 'lock': return (<svg viewBox="0 0 32 32" style={s}><rect x="7" y="14" width="18" height="14" rx="2" {...stroke}/><path d="M11 14V9a5 5 0 0 1 10 0v5" {...stroke}/></svg>);
    case 'logout': return (<svg viewBox="0 0 32 32" style={s}><path d="M14 6H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" {...stroke}/><path d="M20 11l5 5-5 5M11 16h14" {...stroke}/></svg>);
    case 'arrow-r': return (<svg viewBox="0 0 32 32" style={s}><path d="M6 16h20M20 8l8 8-8 8" {...stroke}/></svg>);
    case 'arrow-l': return (<svg viewBox="0 0 32 32" style={s}><path d="M26 16H6M12 8l-8 8 8 8" {...stroke}/></svg>);
    case 'logo': return (<svg viewBox="0 0 32 32" style={s}><circle cx="10" cy="11" r="4" {...stroke}/><circle cx="10" cy="22" r="4" {...stroke}/><path d="M13 13l16 8M13 20l16-8" {...stroke}/></svg>);
    case 'cloud': return (<svg viewBox="0 0 32 32" style={s}><path d="M9 24a6 6 0 0 1-1-11.9A8 8 0 0 1 23.5 13 5.5 5.5 0 0 1 24 24H9z" {...stroke}/></svg>);
    case 'cloud-off': return (<svg viewBox="0 0 32 32" style={s}><path d="M9 24a6 6 0 0 1-1-11.9A8 8 0 0 1 23.5 13 5.5 5.5 0 0 1 24 24H9z" {...stroke}/><path d="M5 5l22 22" {...stroke}/></svg>);
    default: return null;
  }
}
