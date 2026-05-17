// cobro-web.jsx — Web cobro view, big tappable buttons, Android Material dark
// Flow: empleado elige perfil → Iniciar turno → cobra → Cerrar turno (resumen + total a llevar)
const { useState, useEffect, useMemo } = React;

let TH = THEMES.barberia;
function syncTH(theme) {
  TH = { ...theme, gold: theme.accent };
}
try {
  const stored = localStorage.getItem('tijera.theme.v1');
  if (stored && THEMES[stored]) syncTH(THEMES[stored]);
  else syncTH(THEMES.flow);
} catch { syncTH(THEMES.flow); }

function fmtTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function App() {
  const [state, setState] = useStore();
  const [theme] = useTheme();
  syncTH(theme);
  const activeEmps = state.employees.filter(e => e.active);
  const [empId, setEmpId] = useState(() => {
    // Prefer employee with open shift, else first active
    const openIds = Object.keys(state.openShifts || {});
    if (openIds.length > 0) return openIds[0];
    return activeEmps[0]?.id;
  });

  const employee = state.employees.find(e => e.id === empId);
  const openShift = (state.openShifts || {})[empId];
  const [showSummary, setShowSummary] = useState(false);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const totals = useMemo(() => {
    if (!openShift || !employee) return { total: 0, emp: 0, shop: 0, byMethod: {} };
    const pct = (employee.commissionPct || 50) / 100;
    return openShift.entries.reduce((acc, e) => {
      acc.total += e.price;
      acc.emp += e.price * pct;
      acc.shop += e.price * (1 - pct);
      acc.byMethod[e.method] = (acc.byMethod[e.method] || 0) + e.price;
      return acc;
    }, { total: 0, emp: 0, shop: 0, byMethod: {} });
  }, [openShift, employee]);

  function startShift() {
    setState(s => ({
      ...s,
      openShifts: { ...(s.openShifts || {}), [empId]: { id: uid('sh'), empId, startTime: new Date().toISOString(), entries: [] } }
    }));
  }
  function pickService(svc) { setPending(svc); }
  function confirmPayment(method) {
    const entry = { id: uid('en'), svcId: pending.id, name: pending.name, icon: pending.icon, price: pending.price, method, t: new Date().toISOString() };
    setState(s => ({
      ...s,
      openShifts: { ...s.openShifts, [empId]: { ...s.openShifts[empId], entries: [...s.openShifts[empId].entries, entry] } }
    }));
    setToast({ name: pending.name, amount: pending.price });
    setPending(null);
  }
  function removeEntry(entryId) {
    setState(s => ({
      ...s,
      openShifts: { ...s.openShifts, [empId]: { ...s.openShifts[empId], entries: s.openShifts[empId].entries.filter(e => e.id !== entryId) } }
    }));
  }
  function closeShift() {
    if (!openShift || !employee) return;
    const pct = (employee.commissionPct || 50);
    const total = openShift.entries.reduce((a, e) => a + e.price, 0);
    const empCut = Math.round(total * pct / 100);
    const shopCut = total - empCut;
    const closed = {
      id: openShift.id, empId, empName: employee.name, commissionPct: pct,
      startTime: openShift.startTime, endTime: new Date().toISOString(),
      entries: openShift.entries, total, empCut, shopCut,
    };
    setState(s => {
      const { [empId]: _, ...rest } = s.openShifts || {};
      return { ...s, openShifts: rest, shifts: [...(s.shifts || []), closed] };
    });
    setShowSummary(false);
  }

  if (!employee || state.services.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No hay configuración</div>
          <div style={{ color: TH.textDim, marginBottom: 16 }}>Pedile al admin que registre empleados y servicios.</div>
          <a href="admin.html" style={{ color: TH.gold }}>Abrir panel admin →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <ThemeStyle TH={TH}/>
      <Topbar shopName={state.shopName} employee={employee} employees={activeEmps} setEmpId={setEmpId}
        openShifts={state.openShifts || {}} openShift={openShift} totals={totals}
        onCloseTurn={() => setShowSummary(true)}/>

      {!openShift ? (
        <LockedScreen employee={employee} onStart={startShift}/>
      ) : (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500 }}>SERVICIOS · TAP PARA COBRAR</div>
            <div style={{ fontSize: 12, color: TH.textDim }}>
              Turno abierto desde <span style={{ color: TH.gold, fontFamily: 'Roboto Mono' }}>{fmtTime(openShift.startTime)}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {state.services.map(s => (
              <ServiceTile key={s.id} svc={s} onClick={() => pickService(s)}/>
            ))}
          </div>

          {openShift.entries.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500, marginBottom: 10 }}>
                ÚLTIMOS COBROS · {openShift.entries.length}
              </div>
              <div style={{ background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 14, overflow: 'hidden' }}>
                {[...openShift.entries].reverse().slice(0, 5).map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${TH.line}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TH.gold}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={e.icon} size={18} color={TH.gold}/>
                    </div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: TH.textDim }}>{fmtTime(e.t)}</div>
                    <div style={{ fontFamily: 'Roboto Mono', fontWeight: 500, minWidth: 80, textAlign: 'right' }}>{fmt(e.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pending && <PaymentSheet svc={pending} onCancel={() => setPending(null)} onConfirm={confirmPayment}/>}
      {showSummary && (
        <SummaryModal entries={openShift?.entries || []} totals={totals} employee={employee} approvalCode={state.approvalCode}
          startTime={openShift?.startTime}
          onClose={() => setShowSummary(false)} onRemove={removeEntry} onConfirmClose={closeShift}/>
      )}
      {toast && <Toast {...toast}/>}
    </div>
  );
}

function Topbar({ shopName, employee, employees, setEmpId, openShifts, openShift, totals, onCloseTurn }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5, padding: '16px 32px',
      borderBottom: `1px solid ${TH.line}`, background: 'rgba(14,14,16,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {TH.logo ? (
          <img src={TH.logo} alt="logo" style={{ height: 56, width: 'auto', objectFit: 'contain' }}/>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: TH.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="logo" size={20} color="#0E0E10"/>
          </div>
        )}
        {TH.barberStripe && (
          <div style={{ width: 6, height: 44, borderRadius: 3, background: `repeating-linear-gradient(135deg, ${TH.red} 0 6px, ${TH.white} 6px 12px, ${TH.blue} 12px 18px, ${TH.white} 18px 24px)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }}/>
        )}
        <div>
          <div style={{ fontSize: 10, color: TH.textMute, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Cobro</div>
          <div className="th-title" style={{ fontSize: 14, fontWeight: 700, color: TH.accent, letterSpacing: '0.08em' }}>Barber shop</div>
        </div>
      </div>

      {/* Employee selector — locked while shift open */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 999, padding: '4px 4px 4px 14px' }}>
        <span style={{ fontSize: 12, color: TH.textDim }}>Empleado:</span>
        <select value={employee.id} onChange={e => setEmpId(e.target.value)} disabled={!!openShift} style={{
          background: 'transparent', border: 'none', color: TH.text, fontSize: 14, fontWeight: 500, padding: '8px 10px', cursor: openShift ? 'not-allowed' : 'pointer', outline: 'none', opacity: openShift ? 0.6 : 1,
        }}>
          {employees.map(e => {
            const has = !!openShifts[e.id];
            return <option key={e.id} value={e.id} style={{ background: TH.surface }}>{e.name}{has ? ' · turno abierto' : ''}</option>;
          })}
        </select>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {openShift && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1.5, textTransform: 'uppercase' }}>Turno</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: TH.gold, fontFamily: 'Roboto Mono' }}>{fmt(totals.total)} · {openShift.entries.length}</div>
          </div>
        )}
        {openShift && (
          <button onClick={onCloseTurn} style={{
            height: 44, padding: '0 20px', borderRadius: 999, background: TH.gold, color: '#0E0E10',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, letterSpacing: 0.5,
            display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <Icon name="lock" size={18} color="#0E0E10"/> Cerrar turno
          </button>
        )}
        <a href="index.html" style={{ color: TH.textDim, fontSize: 13 }}>Salir</a>
      </div>
    </div>
  );
}

function LockedScreen({ employee, onStart }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28, background: TH.surface, border: `1px solid ${TH.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
          position: 'relative',
        }}>
          <Icon name="lock" size={42} color={TH.gold}/>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500, marginBottom: 8 }}>TURNO CERRADO</div>
        <h1 className="th-title" style={{ fontSize: 36, fontWeight: 700, margin: '0 0 10px', color: TH.accent, letterSpacing: '0.04em' }}>Hola, {employee.name.split(' ')[0]}</h1>
        <p style={{ color: TH.textDim, fontSize: 15, margin: '0 0 32px', lineHeight: 1.5 }}>
          Para empezar a cobrar, abrí tu turno. Quedará registrado el horario de inicio y todo lo que cobres.
        </p>

        <div style={{ background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 16, padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: employee.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E0E10', fontSize: 22, fontWeight: 600 }}>
            {initials(employee.name)}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{employee.name}</div>
            <div style={{ fontSize: 12, color: TH.textDim }}>{employee.role}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>Comisión</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: TH.gold, fontFamily: 'Roboto Mono' }}>{employee.commissionPct}%</div>
          </div>
        </div>

        <button onClick={onStart} style={{
          width: '100%', height: 64, borderRadius: 18, background: TH.gold, color: '#0E0E10',
          border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 600, letterSpacing: 0.5,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 12px 32px rgba(212,168,87,0.25)',
        }}>
          <Icon name="arrow-r" size={22} color="#0E0E10"/>
          Iniciar turno
        </button>
        <div style={{ fontSize: 12, color: TH.textMute, marginTop: 14 }}>
          Hora actual: <span style={{ color: TH.textDim, fontFamily: 'Roboto Mono' }}>{fmtTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}

function ServiceTile({ svc, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        aspectRatio: '1 / 1.05', background: pressed ? TH.surface3 : TH.surface,
        border: `1px solid ${pressed ? TH.gold : TH.line}`, borderRadius: 18, padding: 18,
        cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        textAlign: 'left', color: TH.text, transition: 'all 80ms ease',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
      }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={svc.icon} size={28} color={TH.gold}/>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>{svc.name}</div>
        <div style={{ fontSize: 22, fontWeight: 500, color: TH.gold, marginTop: 4, fontFamily: 'Roboto Mono', letterSpacing: -0.5 }}>{fmt(svc.price)}</div>
      </div>
    </button>
  );
}

function PaymentSheet({ svc, onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: TH.surface, borderRadius: 20, border: `1px solid ${TH.line}`,
        width: '100%', maxWidth: 520, padding: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={svc.icon} size={32} color={TH.gold}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500 }}>NUEVO COBRO</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{svc.name}</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: TH.gold, fontFamily: 'Roboto Mono', letterSpacing: -1 }}>{fmt(svc.price)}</div>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500, marginBottom: 12 }}>MÉTODO DE PAGO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PAY_METHODS.map(m => (
            <button key={m.id} onClick={() => onConfirm(m.id)} style={{
              height: 80, borderRadius: 14, border: `1px solid ${TH.line}`, background: TH.surface2,
              display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', cursor: 'pointer', color: TH.text,
              transition: 'all 100ms',
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = TH.gold; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = TH.line; }}>
              <Icon name={m.icon} size={28} color={TH.gold}/>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{m.name}</span>
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{
          marginTop: 14, width: '100%', height: 48, borderRadius: 12,
          background: 'transparent', border: `1px solid ${TH.line}`, color: TH.textDim, fontSize: 14, cursor: 'pointer', fontWeight: 500,
        }}>Cancelar</button>
      </div>
    </div>
  );
}

function SummaryModal({ entries, totals, employee, approvalCode, startTime, onClose, onRemove, onConfirmClose }) {
  const [removing, setRemoving] = useState(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  function tryRemove() {
    if (code === approvalCode) {
      onRemove(removing.id);
      setRemoving(null); setCode(''); setErr(false);
    } else { setErr(true); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: TH.surface, borderRadius: 20, border: `1px solid ${TH.line}`,
        width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', position: 'relative',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${TH.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: TH.surface, zIndex: 2 }}>
          <div>
            <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 2, textTransform: 'uppercase' }}>Cierre de turno · {employee.name}</div>
            <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }} className="th-title">Resumen</div>
            {startTime && (
              <div style={{ fontSize: 11, color: TH.textDim, marginTop: 2, fontFamily: 'Roboto Mono' }}>
                {fmtTime(startTime)} → {fmtTime(new Date().toISOString())} · comisión {employee.commissionPct}%
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={20} color={TH.textDim}/>
          </button>
        </div>

        <div style={{ padding: 28 }}>
          {/* HERO: total a llevar */}
          <div style={{
            background: `linear-gradient(135deg, ${TH.gold}26, ${TH.gold}0d)`,
            border: `1px solid ${TH.gold}66`, borderRadius: 18, padding: 24, marginBottom: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: TH.gold, fontWeight: 600 }}>{employee.name.split(' ')[0].toUpperCase()} SE LLEVA</div>
            <div style={{ fontSize: 64, fontWeight: 500, color: TH.gold, marginTop: 6, fontFamily: 'Roboto Mono', letterSpacing: -2, lineHeight: 1 }}>{fmt(totals.emp)}</div>
            <div style={{ fontSize: 12, color: TH.textDim, marginTop: 6 }}>{employee.commissionPct}% sobre {fmt(totals.total)} cobrado · {entries.length} servicios</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: TH.surface2, border: `1px solid ${TH.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 500 }}>Total cobrado</div>
              <div style={{ fontSize: 24, fontWeight: 500, marginTop: 4, fontFamily: 'Roboto Mono' }}>{fmt(totals.total)}</div>
            </div>
            <div style={{ background: TH.surface2, border: `1px solid ${TH.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 500 }}>Queda peluquería</div>
              <div style={{ fontSize: 24, fontWeight: 500, marginTop: 4, fontFamily: 'Roboto Mono' }}>{fmt(totals.shop)}</div>
            </div>
          </div>

          <div style={{ background: TH.surface2, border: `1px solid ${TH.line}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500, marginBottom: 10 }}>POR MÉTODO DE PAGO</div>
            {PAY_METHODS.map(m => {
              const v = totals.byMethod[m.id] || 0;
              const pct = totals.total > 0 ? (v / totals.total) * 100 : 0;
              return (
                <div key={m.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={m.icon} size={16} color={TH.gold}/>{m.name}</span>
                    <span style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(v)}</span>
                  </div>
                  <div style={{ height: 4, background: TH.surface3, borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: TH.gold, borderRadius: 2 }}/>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: TH.surface2, border: `1px solid ${TH.line}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', fontSize: 11, letterSpacing: 2, color: TH.textMute, fontWeight: 500 }}>SERVICIOS REALIZADOS · {entries.length}</div>
            {entries.length === 0 && <div style={{ padding: '20px 16px', color: TH.textDim, fontSize: 13 }}>Aún no cobraste ningún servicio.</div>}
            {[...entries].reverse().map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${TH.line}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TH.gold}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={e.icon} size={20} color={TH.gold}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: TH.textDim }}>{fmtTime(e.t)} · {PAY_METHODS.find(m => m.id === e.method)?.name}</div>
                </div>
                <div style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(e.price)}</div>
                <button onClick={() => { setRemoving(e); setCode(''); setErr(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
                  <Icon name="trash" size={16} color={TH.textMute}/>
                </button>
              </div>
            ))}
          </div>

          {/* Cerrar turno definitivo */}
          <button onClick={() => setConfirmingClose(true)} style={{
            width: '100%', height: 56, borderRadius: 14, background: TH.gold, color: '#0E0E10',
            border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <Icon name="check" size={20} color="#0E0E10"/> Confirmar cierre de turno
          </button>
          <div style={{ fontSize: 11, color: TH.textMute, textAlign: 'center', marginTop: 8 }}>
            Una vez confirmado el turno se guarda en el historial y no podés agregar más servicios.
          </div>
        </div>

        {removing && (
          <ApprovalDialog
            title={`Eliminar ${removing.name}`}
            subtitle="Pedile el código de 4 dígitos al admin"
            code={code} setCode={setCode} err={err} setErr={setErr}
            onCancel={() => setRemoving(null)} onConfirm={tryRemove}
          />
        )}
        {confirmingClose && (
          <div onClick={() => setConfirmingClose(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, zIndex: 5 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: TH.surface, borderRadius: 16, border: `1px solid ${TH.line}`, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center' }}>
              <Icon name="lock" size={32} color={TH.gold}/>
              <div style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}>¿Cerrar turno?</div>
              <div style={{ fontSize: 13, color: TH.textDim, marginTop: 6, marginBottom: 18, lineHeight: 1.4 }}>
                Te llevás <strong style={{ color: TH.gold, fontFamily: 'Roboto Mono' }}>{fmt(totals.emp)}</strong>.<br/>
                Esta acción no se puede deshacer.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmingClose(false)} style={{ flex: 1, height: 44, borderRadius: 999, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text, cursor: 'pointer', fontWeight: 500 }}>Volver</button>
                <button onClick={onConfirmClose} style={{ flex: 1, height: 44, borderRadius: 999, background: TH.gold, color: '#0E0E10', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cerrar turno</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalDialog({ title, subtitle, code, setCode, err, setErr, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, zIndex: 5 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: TH.surface, borderRadius: 16, border: `1px solid ${TH.line}`, padding: 28, maxWidth: 360, width: '90%', textAlign: 'center' }}>
        <Icon name="lock" size={32} color={TH.gold}/>
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>{title}</div>
        <div style={{ fontSize: 12, color: TH.textDim, marginTop: 4, marginBottom: 16 }}>{subtitle}</div>
        <input autoFocus type="password" maxLength="4" value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setErr(false); }}
          style={{ width: '100%', height: 56, padding: '0 14px', background: TH.surface2, border: `1px solid ${err ? TH.red : TH.line}`, borderRadius: 12, color: TH.text, fontSize: 24, textAlign: 'center', letterSpacing: 12, fontFamily: 'Roboto Mono', outline: 'none', boxSizing: 'border-box' }}/>
        {err && <div style={{ color: TH.red, fontSize: 12, marginTop: 6 }}>Código incorrecto</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 44, borderRadius: 999, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text, cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 44, borderRadius: 999, background: TH.gold, color: '#0E0E10', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ name, amount }) {
  return (
    <div style={{
      position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
      background: `${TH.gold}26`, border: `1px solid ${TH.gold}66`, color: TH.text,
      padding: '14px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
      backdropFilter: 'blur(8px)', zIndex: 200, animation: 'toastIn 200ms ease-out',
    }}>
      <Icon name="check" size={20} color={TH.gold}/>
      <span style={{ fontSize: 14, fontWeight: 500 }}>Cobrado · {name}</span>
      <span style={{ fontWeight: 500, color: TH.gold, fontFamily: 'Roboto Mono' }}>{fmt(amount)}</span>
      <style>{`@keyframes toastIn { from { transform: translate(-50%, -12px); opacity: 0 } to { transform: translate(-50%, 0); opacity: 1 } }`}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
