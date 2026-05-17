import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const C = {
  bg: '#0A0807', surface: '#14110D', line: '#3A3022',
  text: '#F5EDD8', textDim: '#B8A578', textMute: '#7A6B4F',
  gold: '#D4A857', red: '#D63B3B', blue: '#1E5CB3',
};

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="9" r="3.2" /><circle cx="8" cy="23" r="3.2" />
      <path d="M10.5 11l16 11M10.5 21l16-11" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 27V5M5 27h22" /><path d="M9 22v-6M14 22v-12M19 22v-8M24 22v-14" />
    </svg>
  );
}

const cardStyle = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14,
  padding: 22, display: 'flex', flexDirection: 'column', gap: 10,
  textDecoration: 'none', color: 'inherit', transition: 'all 200ms ease', minHeight: 180,
};

function NavCard({ to, icon, title, desc }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={to}
      style={{ ...cardStyle, borderColor: hover ? C.gold : C.line, transform: hover ? 'translateY(-2px)' : 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,168,87,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, margin: '4px 0 0', letterSpacing: '0.04em', color: C.gold }}>{title}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim, margin: 0, flex: 1 }}>{desc}</p>
      <span style={{ color: C.gold, fontSize: 20, alignSelf: 'flex-end' }}>→</span>
    </Link>
  );
}

export default function Home() {
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault();
      setDeferred(e);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        color: C.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: `radial-gradient(circle at 50% -10%, rgba(212,168,87,0.12), transparent 50%), radial-gradient(circle at 90% 110%, rgba(214,59,59,0.06), transparent 50%), ${C.bg}`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cinzel:wght@500;700;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 64px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', margin: '28px 0 0' }}>
          <img src="/logo.svg" alt="BarberPro" style={{ width: 84, height: 'auto' }} />
        </div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 42, textAlign: 'center', margin: '10px 0 2px', letterSpacing: '0.08em', color: C.gold }}>
          BarberPro
        </h1>
        <div style={{ fontSize: 12, letterSpacing: 3, color: C.textDim, textTransform: 'uppercase', fontWeight: 600, textAlign: 'center' }}>
          Gestión para barberías
        </div>
        <div
          style={{
            width: 220, height: 8, margin: '22px auto 30px', borderRadius: 4,
            background: `repeating-linear-gradient(135deg, ${C.red} 0 14px, #F5EDD8 14px 28px, ${C.blue} 28px 42px, #F5EDD8 42px 56px)`,
          }}
        />
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 26, textAlign: 'center', margin: '0 0 32px', letterSpacing: '0.06em', color: C.text }}>
          Elegí cómo entrar
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <NavCard to="/cobro" icon={<ScissorsIcon />} title="Cobro" desc="Pantalla del empleado. Iniciar turno, cobrar servicios y cerrar caja." />
          <NavCard to="/admin" icon={<ChartIcon />} title="Admin" desc="Configuración, empleados, comisiones, gastos y reportes." />
        </div>

        {deferred && (
          <button
            onClick={install}
            style={{
              marginTop: 24, padding: '14px 20px', borderRadius: 10, background: C.gold, color: C.bg,
              border: 'none', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            📲 Instalar app en este dispositivo
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 32, fontSize: 11, color: C.textMute, letterSpacing: 1 }}>
          BARBERPRO · GESTIÓN PARA BARBERÍAS
        </div>
      </div>
    </div>
  );
}
