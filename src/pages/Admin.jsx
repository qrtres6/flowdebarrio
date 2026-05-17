// Admin — panel del dueño: reportes, gastos, servicios, empleados y configuración.
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.js';
import { useTheme, ThemeStyle, withAliases, THEMES, loadTheme } from '../lib/theme.jsx';
import { Icon } from '../lib/icons.jsx';
import { PAY_METHODS, ICON_OPTIONS, DEFAULT_STATE } from '../lib/constants.js';
import { fmt, uid, initials, fmtDate, fmtDateTime, startOfDay, startOfWeek, startOfMonth } from '../lib/format.js';
import SyncBadge from '../components/SyncBadge.jsx';

let TH = withAliases(THEMES[loadTheme()] || THEMES.barberia);

export default function Admin() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem('flow.admin.authed') === '1'; } catch { return false; }
  });
  const [state, setState, syncStatus] = useStore();
  const [theme, setTheme, themeId] = useTheme();
  TH = withAliases(theme);
  const [tab, setTab] = useState('panel');
  const [period, setPeriod] = useState('month');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function notify(msg, kind = 'ok') {
    setToast({ msg, kind });
  }

  if (!authed) {
    return (
      <AdminLogin
        TH={TH}
        adminPassword={state.adminPassword || 'flow2026'}
        onOk={() => {
          try { sessionStorage.setItem('flow.admin.authed', '1'); } catch { /* ignore */ }
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <ThemeStyle TH={TH} />
      <Sidebar tab={tab} setTab={setTab} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          tab={tab} shopName={state.shopName} syncStatus={syncStatus}
          onLogout={() => {
            try { sessionStorage.removeItem('flow.admin.authed'); } catch { /* ignore */ }
            setAuthed(false);
          }}
        />
        <div style={{ padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', flex: 1 }}>
          {tab === 'panel' && <Panel state={state} period={period} setPeriod={setPeriod} />}
          {tab === 'reportes' && <Reportes state={state} period={period} setPeriod={setPeriod} />}
          {tab === 'gastos' && <Gastos state={state} setState={setState} notify={notify} period={period} setPeriod={setPeriod} />}
          {tab === 'servicios' && <Servicios state={state} setState={setState} notify={notify} />}
          {tab === 'empleados' && <Empleados state={state} setState={setState} notify={notify} />}
          {tab === 'config' && <Config state={state} setState={setState} notify={notify} themeId={themeId} setTheme={setTheme} />}
        </div>
      </main>
      {toast && <Snackbar {...toast} />}
    </div>
  );
}

// ─── Sidebar ───
function Sidebar({ tab, setTab }) {
  const items = [
    { id: 'panel', label: 'Panel', icon: 'home' },
    { id: 'reportes', label: 'Reportes', icon: 'chart' },
    { id: 'gastos', label: 'Gastos', icon: 'cash' },
    { id: 'servicios', label: 'Servicios', icon: 'scissors' },
    { id: 'empleados', label: 'Empleados', icon: 'user' },
    { id: 'config', label: 'Configuración', icon: 'gear' },
  ];
  return (
    <aside
      style={{
        width: 240, flexShrink: 0, background: TH.surface, borderRight: `1px solid ${TH.line}`,
        padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4,
        position: 'sticky', top: 0, height: '100vh', alignSelf: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px 18px' }}>
        {TH.logo ? (
          <img src={TH.logo} alt="logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: TH.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="logo" size={20} color="#0E0E10" />
          </div>
        )}
        {TH.barberStripe && (
          <div style={{ width: 4, height: 36, borderRadius: 2, background: `repeating-linear-gradient(135deg, ${TH.red} 0 5px, ${TH.white} 5px 10px, ${TH.blue} 10px 15px, ${TH.white} 15px 20px)` }} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, color: TH.textMute, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Admin</div>
          <div className="th-title" style={{ fontSize: 14, fontWeight: 700, color: TH.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.06em' }}>
            Flow de Barrio
          </div>
        </div>
      </div>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', borderRadius: 999, cursor: 'pointer',
              background: active ? `${TH.gold}1f` : 'transparent',
              border: 'none', color: active ? TH.gold : TH.textDim,
              fontSize: 14, fontWeight: active ? 500 : 400, textAlign: 'left', transition: 'all 150ms ease',
            }}
          >
            <Icon name={it.icon} size={20} color={active ? TH.gold : TH.textDim} />
            {it.label}
          </button>
        );
      })}
      <div style={{ marginTop: 'auto', padding: 12, borderTop: `1px solid ${TH.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: TH.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TH.gold, fontSize: 12, fontWeight: 700, border: `1px solid ${TH.line}` }}>AD</div>
        <div style={{ fontSize: 12 }}>
          <div style={{ color: TH.text, fontWeight: 500 }}>Admin</div>
          <div style={{ color: TH.textMute, fontSize: 11 }}>Sesión activa</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───
function Topbar({ tab, shopName, syncStatus, onLogout }) {
  const titles = { panel: 'Panel', reportes: 'Reportes', gastos: 'Gastos', servicios: 'Servicios', empleados: 'Empleados', config: 'Configuración' };
  return (
    <div
      style={{
        height: 72, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${TH.line}`, background: 'rgba(14,14,16,0.6)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 5,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shopName}</div>
        <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap' }}>{titles[tab]}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SyncBadge status={syncStatus} TH={TH} />
        <Link to="/cobro" style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          <Icon name="arrow-r" size={16} color={TH.gold} /> Abrir cobro
        </Link>
        <button onClick={onLogout} title="Cerrar sesión" style={{ height: 40, width: 40, borderRadius: 999, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.textDim, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="logout" size={16} color={TH.textDim} />
        </button>
      </div>
    </div>
  );
}

// ─── Period selector ───
function PeriodTabs({ value, onChange }) {
  const opts = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'all', label: 'Todo' },
  ];
  return (
    <div style={{ display: 'inline-flex', background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 999, padding: 4 }}>
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: value === o.id ? TH.gold : 'transparent',
            color: value === o.id ? '#0E0E10' : TH.textDim,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const PERIOD_LABEL = { today: 'hoy', week: 'esta semana', month: 'este mes', all: 'histórico' };

function filterByPeriod(items, period, getDate) {
  if (period === 'all') return items;
  const now = new Date();
  let from;
  if (period === 'today') from = startOfDay(now);
  else if (period === 'week') from = startOfWeek(now);
  else if (period === 'month') from = startOfMonth(now);
  return items.filter((it) => new Date(getDate(it)) >= from);
}

function aggregateShifts(shifts) {
  let totalRevenue = 0, totalEmpCut = 0, totalShopCut = 0, totalServices = 0;
  const byMethod = {};
  const byService = {};
  const byEmployee = {};

  for (const sh of shifts) {
    totalRevenue += sh.total;
    totalEmpCut += sh.empCut;
    totalShopCut += sh.shopCut;
    totalServices += sh.entries.length;
    if (!byEmployee[sh.empId]) byEmployee[sh.empId] = { total: 0, empCut: 0, shopCut: 0, services: 0, shifts: 0 };
    byEmployee[sh.empId].total += sh.total;
    byEmployee[sh.empId].empCut += sh.empCut;
    byEmployee[sh.empId].shopCut += sh.shopCut;
    byEmployee[sh.empId].services += sh.entries.length;
    byEmployee[sh.empId].shifts += 1;
    for (const e of sh.entries) {
      byMethod[e.method] = (byMethod[e.method] || 0) + e.price;
      if (!byService[e.svcId]) byService[e.svcId] = { count: 0, revenue: 0, empCut: 0, shopCut: 0 };
      byService[e.svcId].count += 1;
      byService[e.svcId].revenue += e.price;
      byService[e.svcId].empCut += e.price * (sh.commissionPct / 100);
      byService[e.svcId].shopCut += e.price * (1 - sh.commissionPct / 100);
    }
  }
  return { totalRevenue, totalEmpCut, totalShopCut, totalServices, byMethod, byService, byEmployee };
}

// ─── Panel ───
function Panel({ state, period, setPeriod }) {
  const shifts = filterByPeriod(state.shifts || [], period, (s) => s.endTime);
  const expenses = filterByPeriod(state.expenses || [], period, (e) => e.date);
  const agg = useMemo(() => aggregateShifts(shifts), [shifts]);
  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const ganancia = agg.totalShopCut - totalExpenses;
  const periodLabel = PERIOD_LABEL[period];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: TH.textDim }}>Mostrando datos de <strong style={{ color: TH.text }}>{periodLabel}</strong></div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <Card pad={28} style={{ background: `linear-gradient(135deg, ${TH.surface}, ${TH.surface2})`, borderColor: TH.gold + '44' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: TH.gold, letterSpacing: 2, fontWeight: 600 }}>GANANCIA NETA · {periodLabel.toUpperCase()}</div>
            <div style={{ fontSize: 56, fontWeight: 500, color: ganancia >= 0 ? TH.gold : TH.red, marginTop: 6, fontFamily: 'Roboto Mono', letterSpacing: -2, lineHeight: 1 }}>{fmt(ganancia)}</div>
            <div style={{ fontSize: 12, color: TH.textDim, marginTop: 8 }}>
              Ingresos peluquería <strong style={{ color: TH.text, fontFamily: 'Roboto Mono' }}>{fmt(agg.totalShopCut)}</strong> − gastos <strong style={{ color: TH.text, fontFamily: 'Roboto Mono' }}>{fmt(totalExpenses)}</strong>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: 24, alignSelf: 'center' }}>
            <MiniStat label="Facturación" value={fmt(agg.totalRevenue)} />
            <MiniStat label="Comisiones" value={fmt(agg.totalEmpCut)} color={TH.textDim} />
            <MiniStat label="Servicios" value={agg.totalServices} />
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Card pad={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="scissors" size={20} color={TH.gold} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, marginTop: 14, letterSpacing: -0.5 }}>{state.services.length}</div>
          <div style={{ fontSize: 12, color: TH.textDim, marginTop: 2 }}>Servicios activos</div>
        </Card>
        <Card pad={20}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={20} color={TH.gold} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, marginTop: 14, letterSpacing: -0.5 }}>
            {state.employees.filter((e) => e.active).length}
            <span style={{ color: TH.textMute, fontSize: 18 }}> / {state.employees.length}</span>
          </div>
          <div style={{ fontSize: 12, color: TH.textDim, marginTop: 2 }}>Empleados activos</div>
        </Card>
        <Card pad={20}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={20} color={TH.gold} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, marginTop: 14, letterSpacing: -0.5 }}>{shifts.length}</div>
          <div style={{ fontSize: 12, color: TH.textDim, marginTop: 2 }}>Turnos cerrados</div>
        </Card>
        <Card pad={20}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${TH.red}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cash" size={20} color={TH.red} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, marginTop: 14, letterSpacing: -0.5, color: TH.red }}>{fmt(totalExpenses)}</div>
          <div style={{ fontSize: 12, color: TH.textDim, marginTop: 2 }}>Gastos {periodLabel}</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card pad={0}>
          <div style={{ padding: '20px 24px 12px' }}>
            <SectionHead title="Por empleado" subtitle="Cobrado, comisión y aporte a la peluquería" />
          </div>
          {Object.keys(agg.byEmployee).length === 0 && <Empty msg="Sin turnos cerrados en este período" />}
          {Object.entries(agg.byEmployee)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([empId, row]) => {
              const e = state.employees.find((x) => x.id === empId);
              if (!e) return null;
              return (
                <div key={empId} style={{ display: 'grid', gridTemplateColumns: '40px 1.2fr 1fr 1fr', gap: 14, alignItems: 'center', padding: '14px 24px', borderTop: `1px solid ${TH.line}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: e.color, color: '#0E0E10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{initials(e.name)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: TH.textMute }}>{row.services} servicios · {row.shifts} turnos · {e.commissionPct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>Comisión</div>
                    <div style={{ fontSize: 14, color: TH.textDim, fontFamily: 'Roboto Mono' }}>{fmt(row.empCut)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>Para peluquería</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: TH.gold, fontFamily: 'Roboto Mono' }}>{fmt(row.shopCut)}</div>
                  </div>
                </div>
              );
            })}
        </Card>

        <Card pad={24}>
          <SectionHead title="Por método de pago" />
          {Object.keys(agg.byMethod).length === 0 && <Empty msg="Sin cobros registrados" />}
          {PAY_METHODS.map((m) => {
            const v = agg.byMethod[m.id] || 0;
            const pct = agg.totalRevenue > 0 ? (v / agg.totalRevenue) * 100 : 0;
            return (
              <div key={m.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name={m.icon} size={16} color={TH.gold} />{m.name}
                  </span>
                  <span style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(v)}</span>
                </div>
                <div style={{ height: 6, background: TH.surface3, borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: TH.gold, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2, fontFamily: 'Roboto Mono', color: color || TH.text }}>{value}</div>
    </div>
  );
}

function Empty({ msg }) {
  return <div style={{ padding: '32px 16px', textAlign: 'center', color: TH.textMute, fontSize: 13 }}>{msg}</div>;
}

// ─── Reportes ───
function Reportes({ state, period, setPeriod }) {
  const shifts = filterByPeriod(state.shifts || [], period, (s) => s.endTime);
  const agg = useMemo(() => aggregateShifts(shifts), [shifts]);
  const periodLabel = PERIOD_LABEL[period];
  const sortedServices = Object.entries(agg.byService).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxRevenue = sortedServices[0]?.[1]?.revenue || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: TH.textDim }}>Reporte de <strong style={{ color: TH.text }}>{periodLabel}</strong></div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <Card pad={0}>
        <div style={{ padding: '20px 24px 14px' }}>
          <SectionHead
            title="Detalle por servicio"
            subtitle="Cuánto cobró cada uno, comisiones pagadas y ganancia neta para la peluquería"
            right={<span style={{ fontSize: 12, color: TH.textDim }}>{sortedServices.length} servicios</span>}
          />
        </div>
        {sortedServices.length === 0 && <Empty msg="Sin servicios cobrados en este período" />}
        {sortedServices.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${TH.line}`, borderTop: `1px solid ${TH.line}` }}>
                  <Th>Servicio</Th>
                  <Th align="right">Ventas</Th>
                  <Th align="right">Cobrado</Th>
                  <Th align="right">Comisión</Th>
                  <Th align="right">Neto peluquería</Th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map(([svcId, row]) => {
                  const s = state.services.find((x) => x.id === svcId) || { name: 'Servicio borrado', icon: 'scissors', price: 0 };
                  return (
                    <tr key={svcId} style={{ borderBottom: `1px solid ${TH.line}` }}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TH.gold}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={s.icon} size={20} color={TH.gold} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                            <div style={{ height: 4, width: 140, background: TH.surface3, borderRadius: 2, marginTop: 6 }}>
                              <div style={{ width: `${(row.revenue / maxRevenue) * 100}%`, height: '100%', background: TH.gold, borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', color: TH.textDim }}>{row.count}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(row.revenue)}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', color: TH.textDim }}>−{fmt(row.empCut)}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600, color: TH.gold }}>{fmt(row.shopCut)}</span></Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: TH.surface2 }}>
                  <Td><strong style={{ color: TH.text }}>Total</strong></Td>
                  <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600 }}>{agg.totalServices}</span></Td>
                  <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600 }}>{fmt(agg.totalRevenue)}</span></Td>
                  <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600, color: TH.textDim }}>−{fmt(agg.totalEmpCut)}</span></Td>
                  <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600, color: TH.gold }}>{fmt(agg.totalShopCut)}</span></Td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card pad={0}>
        <div style={{ padding: '20px 24px 14px' }}>
          <SectionHead title="Turnos cerrados" subtitle="Cada cierre de turno guardado en el sistema" />
        </div>
        {shifts.length === 0 && <Empty msg="Sin turnos cerrados todavía" />}
        {shifts.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${TH.line}`, borderBottom: `1px solid ${TH.line}` }}>
                  <Th>Empleado</Th>
                  <Th>Inicio</Th>
                  <Th>Fin</Th>
                  <Th align="right">Servicios</Th>
                  <Th align="right">Cobrado</Th>
                  <Th align="right">Empleado</Th>
                  <Th align="right">Peluquería</Th>
                </tr>
              </thead>
              <tbody>
                {[...shifts].sort((a, b) => new Date(b.endTime) - new Date(a.endTime)).map((sh) => {
                  const e = state.employees.find((x) => x.id === sh.empId);
                  return (
                    <tr key={sh.id} style={{ borderBottom: `1px solid ${TH.line}` }}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 999, background: e?.color || TH.surface3, color: '#0E0E10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{initials(sh.empName)}</div>
                          <div style={{ fontWeight: 500 }}>{sh.empName}</div>
                          <span style={{ fontSize: 10, color: TH.textMute, padding: '2px 8px', borderRadius: 999, border: `1px solid ${TH.line}` }}>{sh.commissionPct}%</span>
                        </div>
                      </Td>
                      <Td><span style={{ fontFamily: 'Roboto Mono', fontSize: 13, color: TH.textDim }}>{fmtDateTime(sh.startTime)}</span></Td>
                      <Td><span style={{ fontFamily: 'Roboto Mono', fontSize: 13, color: TH.textDim }}>{fmtDateTime(sh.endTime)}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono' }}>{sh.entries.length}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(sh.total)}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', color: TH.textDim }}>{fmt(sh.empCut)}</span></Td>
                      <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 600, color: TH.gold }}>{fmt(sh.shopCut)}</span></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Gastos ───
function Gastos({ state, setState, notify, period, setPeriod }) {
  const [creating, setCreating] = useState(false);
  const expenses = filterByPeriod(state.expenses || [], period, (e) => e.date);
  const total = expenses.reduce((a, e) => a + Number(e.amount), 0);

  const byCat = {};
  for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;

  function create(exp) {
    setState((prev) => ({ ...prev, expenses: [...(prev.expenses || []), { ...exp, id: uid('gx') }] }));
    notify('Gasto registrado');
    setCreating(false);
  }
  function remove(id) {
    if (!confirm('¿Eliminar este gasto?')) return;
    setState((prev) => ({ ...prev, expenses: (prev.expenses || []).filter((e) => e.id !== id) }));
    notify('Gasto eliminado');
  }

  const periodLabel = PERIOD_LABEL[period];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: TH.textDim }}>Gastos de <strong style={{ color: TH.text }}>{periodLabel}</strong></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <PeriodTabs value={period} onChange={setPeriod} />
          <FabBtn icon="plus" label="Nuevo gasto" onClick={() => setCreating(true)} />
        </div>
      </div>

      <Card pad={24}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 2, fontWeight: 500 }}>TOTAL GASTADO · {periodLabel.toUpperCase()}</div>
            <div style={{ fontSize: 48, fontWeight: 500, color: TH.red, marginTop: 4, fontFamily: 'Roboto Mono', letterSpacing: -1 }}>{fmt(total)}</div>
            <div style={{ fontSize: 12, color: TH.textDim, marginTop: 4 }}>
              {expenses.length} gasto{expenses.length === 1 ? '' : 's'} registrado{expenses.length === 1 ? '' : 's'}
            </div>
          </div>
          {cats.length > 0 && (
            <div style={{ flex: 1, minWidth: 280, maxWidth: 480 }}>
              {cats.map(([cat, amt]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{cat}</span>
                    <span style={{ fontFamily: 'Roboto Mono', fontWeight: 500 }}>{fmt(amt)}</span>
                  </div>
                  <div style={{ height: 6, background: TH.surface3, borderRadius: 3 }}>
                    <div style={{ width: `${(amt / maxCat) * 100}%`, height: '100%', background: TH.red, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card pad={0}>
        <div style={{ padding: '20px 24px 14px' }}>
          <SectionHead title="Detalle de gastos" />
        </div>
        {expenses.length === 0 && <Empty msg="No hay gastos registrados en este período" />}
        {expenses.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${TH.line}`, borderBottom: `1px solid ${TH.line}` }}>
                <Th>Fecha</Th>
                <Th>Categoría</Th>
                <Th>Detalle</Th>
                <Th align="right">Monto</Th>
                <Th align="right">{''}</Th>
              </tr>
            </thead>
            <tbody>
              {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${TH.line}` }}>
                  <Td><span style={{ fontFamily: 'Roboto Mono', fontSize: 13, color: TH.textDim }}>{fmtDate(e.date)}</span></Td>
                  <Td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: TH.surface2, border: `1px solid ${TH.line}`, fontSize: 12 }}>
                      {e.category}
                    </span>
                  </Td>
                  <Td><span style={{ color: TH.textDim }}>{e.note || '—'}</span></Td>
                  <Td align="right"><span style={{ fontFamily: 'Roboto Mono', fontWeight: 500, color: TH.red }}>−{fmt(e.amount)}</span></Td>
                  <Td align="right">
                    <button onClick={() => remove(e.id)} style={iconBtnStyle} title="Eliminar"><Icon name="trash" size={16} color={TH.textDim} /></button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {creating && (
        <ExpenseModal
          exp={{ category: state.expenseCategories[0], amount: '', date: new Date().toISOString().slice(0, 10), note: '' }}
          categories={state.expenseCategories}
          isNew
          onSave={create}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  );
}

function ExpenseModal({ exp, categories, isNew, onSave, onCancel }) {
  const [category, setCategory] = useState(exp.category);
  const [amount, setAmount] = useState(exp.amount);
  const [date, setDate] = useState(exp.date);
  const [note, setNote] = useState(exp.note);

  return (
    <Modal title={isNew ? 'Nuevo gasto' : 'Editar gasto'} onClose={onCancel}>
      <Field label="Categoría">
        <SelectField value={category} onChange={setCategory} options={categories} />
      </Field>
      <Field label="Fecha">
        <TextField type="date" value={date} onChange={setDate} />
      </Field>
      <Field label="Monto">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: TH.textDim }}>$</span>
          <TextField type="number" value={amount} onChange={(v) => setAmount(v)} style={{ paddingLeft: 28 }} />
        </div>
      </Field>
      <Field label="Detalle (opcional)">
        <TextField value={note} onChange={setNote} placeholder="Ej. Alquiler octubre" />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text }}>Cancelar</button>
        <button
          onClick={() => {
            const n = Number(amount);
            if (!n || n <= 0) return alert('Ingresá un monto válido');
            onSave({ ...exp, category, amount: n, date, note });
          }}
          style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none' }}
        >
          {isNew ? 'Registrar gasto' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Servicios ───
function Servicios({ state, setState, notify }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function save(svc) {
    setState((prev) => ({ ...prev, services: prev.services.map((s) => (s.id === svc.id ? svc : s)) }));
    notify('Servicio actualizado');
    setEditing(null);
  }
  function create(svc) {
    const newSvc = { ...svc, id: uid('s') };
    setState((prev) => ({ ...prev, services: [...prev.services, newSvc] }));
    notify('Servicio creado');
    setCreating(false);
  }
  function remove(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    setState((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) }));
    notify('Servicio eliminado');
    setEditing(null);
  }

  return (
    <div>
      <ToolBar
        info={`${state.services.length} servicios configurados · la comisión la define cada empleado`}
        actions={<FabBtn icon="plus" label="Nuevo servicio" onClick={() => setCreating(true)} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginTop: 18 }}>
        {state.services.map((s) => (
          <ServiceCard key={s.id} svc={s} onClick={() => setEditing(s)} />
        ))}
      </div>
      {editing && <ServiceModal svc={editing} onSave={save} onCancel={() => setEditing(null)} onDelete={() => remove(editing.id)} />}
      {creating && <ServiceModal svc={{ name: '', price: 5000, icon: 'scissors' }} isNew onSave={create} onCancel={() => setCreating(false)} />}
    </div>
  );
}

function ServiceCard({ svc, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 16,
        padding: 18, textAlign: 'left', cursor: 'pointer', color: TH.text,
        display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 150ms ease',
      }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = TH.gold + '88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = TH.line; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${TH.gold}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={svc.icon} size={24} color={TH.gold} />
        </div>
        <span style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>EDITAR</span>
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 2 }}>{svc.name}</div>
        <div style={{ fontSize: 12, color: TH.textDim }}>Precio fijo</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${TH.line}` }}>
        <span style={{ fontSize: 26, fontWeight: 500, color: TH.gold, letterSpacing: -0.5, fontFamily: 'Roboto Mono' }}>{fmt(svc.price)}</span>
      </div>
    </button>
  );
}

function ServiceModal({ svc, isNew, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(svc.name);
  const [price, setPrice] = useState(svc.price);
  const [icon, setIcon] = useState(svc.icon);

  return (
    <Modal title={isNew ? 'Nuevo servicio' : 'Editar servicio'} onClose={onCancel}>
      <Field label="Nombre">
        <TextField value={name} onChange={setName} placeholder="Ej. Corte clásico" />
      </Field>
      <Field label="Ícono">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {ICON_OPTIONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              style={{
                aspectRatio: '1', borderRadius: 10, border: `1px solid ${ic === icon ? TH.gold : TH.line}`,
                background: ic === icon ? `${TH.gold}1a` : TH.surface2, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name={ic} size={22} color={ic === icon ? TH.gold : TH.textDim} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Precio">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: TH.textDim }}>$</span>
          <TextField type="number" value={price} onChange={(v) => setPrice(Number(v))} style={{ paddingLeft: 28 }} />
        </div>
      </Field>

      <div style={{ background: TH.surface2, borderRadius: 12, padding: 14, margin: '8px 0 16px', fontSize: 12, color: TH.textDim, lineHeight: 1.5 }}>
        La comisión por este servicio depende del empleado que lo cobre. Configurala en <strong style={{ color: TH.text }}>Empleados</strong>.
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {!isNew && (
          <button onClick={onDelete} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.red}66`, color: TH.red }}>
            <Icon name="trash" size={16} color={TH.red} /> Eliminar
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={onCancel} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text }}>Cancelar</button>
        <button onClick={() => onSave({ ...svc, name, price, icon })} style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none' }}>
          {isNew ? 'Crear servicio' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Empleados ───
function Empleados({ state, setState, notify }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function save(emp) {
    setState((prev) => ({ ...prev, employees: prev.employees.map((e) => (e.id === emp.id ? emp : e)) }));
    notify('Empleado actualizado');
    setEditing(null);
  }
  function create(emp) {
    const newE = { ...emp, id: uid('e') };
    setState((prev) => ({ ...prev, employees: [...prev.employees, newE] }));
    notify('Empleado registrado');
    setCreating(false);
  }
  function remove(id) {
    if (!confirm('¿Eliminar este empleado?')) return;
    setState((prev) => ({ ...prev, employees: prev.employees.filter((e) => e.id !== id) }));
    notify('Empleado eliminado');
    setEditing(null);
  }
  function toggleActive(id) {
    setState((prev) => ({ ...prev, employees: prev.employees.map((e) => (e.id === id ? { ...e, active: !e.active } : e)) }));
  }

  return (
    <div>
      <ToolBar
        info={`${state.employees.filter((e) => e.active).length} activos · ${state.employees.length} totales`}
        actions={<FabBtn icon="plus" label="Registrar empleado" onClick={() => setCreating(true)} />}
      />

      <Card pad={0} style={{ marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${TH.line}` }}>
              <Th>Empleado</Th>
              <Th>Rol</Th>
              <Th align="right">Comisión</Th>
              <Th>Ingresó</Th>
              <Th>Estado</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {state.employees.map((e) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${TH.line}` }}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 999, background: e.color, color: '#0E0E10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                      {initials(e.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: TH.textMute, fontFamily: 'Roboto Mono' }}>{e.id}</div>
                    </div>
                  </div>
                </Td>
                <Td>{e.role}</Td>
                <Td align="right">
                  <span style={{ fontFamily: 'Roboto Mono', fontWeight: 600, color: TH.gold, fontSize: 16 }}>{e.commissionPct}%</span>
                </Td>
                <Td><span style={{ color: TH.textDim, fontFamily: 'Roboto Mono', fontSize: 13 }}>{e.startDate}</span></Td>
                <Td>
                  <button
                    onClick={() => toggleActive(e.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
                      background: e.active ? `${TH.green}1a` : TH.surface2, border: `1px solid ${e.active ? TH.green : TH.line}`,
                      color: e.active ? TH.green : TH.textDim, fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: e.active ? TH.green : TH.textMute }} />
                    {e.active ? 'Activo' : 'Inactivo'}
                  </button>
                </Td>
                <Td align="right">
                  <button onClick={() => setEditing(e)} style={iconBtnStyle} title="Editar"><Icon name="edit" size={16} color={TH.textDim} /></button>
                  <button onClick={() => remove(e.id)} style={iconBtnStyle} title="Eliminar"><Icon name="trash" size={16} color={TH.textDim} /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && <EmployeeModal emp={editing} onSave={save} onCancel={() => setEditing(null)} onDelete={() => remove(editing.id)} />}
      {creating && (
        <EmployeeModal
          emp={{ name: '', role: 'Barbero', active: true, startDate: new Date().toISOString().slice(0, 10), color: '#B8893E', commissionPct: 50 }}
          isNew
          onSave={create}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  );
}

function EmployeeModal({ emp, isNew, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(emp.name);
  const [role, setRole] = useState(emp.role);
  const [active, setActive] = useState(emp.active);
  const [startDate, setStartDate] = useState(emp.startDate);
  const [color, setColor] = useState(emp.color);
  const [pct, setPct] = useState(emp.commissionPct ?? 50);

  const colors = ['#D4A857', '#B8893E', '#6E8E63', '#7DBB6E', '#C97A4A', '#A56CB8', '#5E89B8', '#C76A6A'];

  return (
    <Modal title={isNew ? 'Registrar empleado' : 'Editar empleado'} onClose={onCancel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0 16px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: color, color: '#0E0E10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
          {initials(name || 'NN')}
        </div>
        <div>
          <div style={{ fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>Color del avatar</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ width: 26, height: 26, borderRadius: 999, background: c, cursor: 'pointer', border: c === color ? `2px solid ${TH.text}` : '2px solid transparent' }}
              />
            ))}
          </div>
        </div>
      </div>

      <Field label="Nombre completo">
        <TextField value={name} onChange={setName} placeholder="Ej. Mateo Ramírez" />
      </Field>
      <Field label="Rol">
        <SelectField value={role} onChange={setRole} options={['Barbero senior', 'Barbero', 'Estilista', 'Aprendiz', 'Recepción']} />
      </Field>

      <Field label={`Comisión sobre cada cobro · ${pct}%`}>
        <input type="range" min="0" max="100" step="1" value={pct} onChange={(e) => setPct(Number(e.target.value))} style={{ width: '100%', accentColor: TH.gold }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TH.textMute, marginTop: 4 }}>
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
        <div style={{ background: TH.surface2, borderRadius: 12, padding: 12, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <div>
            <div style={{ color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 }}>Sobre $10.000</div>
            <div style={{ color: TH.gold, fontSize: 17, fontWeight: 500, fontFamily: 'Roboto Mono' }}>{fmt((10000 * pct) / 100)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 }}>Peluquería</div>
            <div style={{ fontSize: 17, fontWeight: 500, fontFamily: 'Roboto Mono' }}>{fmt(10000 * (1 - pct / 100))}</div>
          </div>
        </div>
      </Field>

      <Field label="Fecha de ingreso">
        <TextField type="date" value={startDate} onChange={setStartDate} />
      </Field>
      <Field label="Estado">
        <Switch value={active} onChange={setActive} onLabel="Activo" offLabel="Inactivo" />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {!isNew && (
          <button onClick={onDelete} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.red}66`, color: TH.red }}>
            <Icon name="trash" size={16} color={TH.red} /> Eliminar
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={onCancel} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text }}>Cancelar</button>
        <button
          onClick={() => onSave({ ...emp, name, role, active, startDate, color, commissionPct: pct })}
          style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none' }}
        >
          {isNew ? 'Registrar empleado' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Configuración ───
function Config({ state, setState, notify, themeId, setTheme }) {
  const [shopName, setShopName] = useState(state.shopName);
  const [code, setCode] = useState(state.approvalCode);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdNew2, setPwdNew2] = useState('');

  function saveShop() {
    setState((prev) => ({ ...prev, shopName }));
    notify('Nombre de la peluquería guardado');
  }
  function savePwd() {
    if (pwdCurrent !== (state.adminPassword || 'flow2026')) { notify('Contraseña actual incorrecta', 'err'); return; }
    if (pwdNew.length < 4) { notify('La nueva contraseña debe tener al menos 4 caracteres', 'err'); return; }
    if (pwdNew !== pwdNew2) { notify('Las contraseñas no coinciden', 'err'); return; }
    setState((prev) => ({ ...prev, adminPassword: pwdNew }));
    setPwdCurrent(''); setPwdNew(''); setPwdNew2('');
    notify('Contraseña actualizada');
  }
  function saveCode() {
    if (!/^\d{4}$/.test(code)) { notify('El código debe ser de 4 dígitos', 'err'); return; }
    setState((prev) => ({ ...prev, approvalCode: code }));
    notify('Código de aprobación actualizado');
  }
  function reset() {
    if (!confirm('¿Restaurar todo a los valores por defecto? Se borran servicios, empleados, gastos y turnos.')) return;
    setState(DEFAULT_STATE);
    setShopName(DEFAULT_STATE.shopName);
    setCode(DEFAULT_STATE.approvalCode);
    notify('Sistema restaurado');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <Card pad={24}>
        <SectionHead title="Tema visual" subtitle="Cambia colores, tipografía y forma. Se aplica a admin y cobro." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {Object.values(THEMES).map((t) => {
            const active = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); notify(`Tema "${t.name}"`); }}
                style={{
                  background: t.bg, border: `2px solid ${active ? t.accent : t.line}`, borderRadius: t.radius,
                  padding: 16, cursor: 'pointer', color: t.text, textAlign: 'left',
                  fontFamily: t.font, position: 'relative', transition: 'all 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: t.radiusSm, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accentInk, fontWeight: 700, fontSize: 14 }}>T</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: t.textDim }}>{t.sub}</div>
                  </div>
                  {active && <div style={{ marginLeft: 'auto', fontSize: 10, color: t.accent, letterSpacing: 1.5, fontWeight: 600 }}>ACTIVO</div>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[t.bg, t.surface, t.surface2, t.surface3, t.line, t.text, t.accent].map((c, i) => (
                    <div key={i} style={{ flex: 1, height: 18, background: c, borderRadius: t.radiusXs }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card pad={24}>
        <SectionHead title="Identidad" subtitle="Aparece en el panel y en la app del empleado." />
        <Field label="Nombre de la peluquería">
          <TextField value={shopName} onChange={setShopName} />
        </Field>
        <button onClick={saveShop} style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none', alignSelf: 'flex-start' }}>
          Guardar cambios
        </button>
      </Card>

      <Card pad={24}>
        <SectionHead title="Código de aprobación" subtitle="4 dígitos · necesario para que un empleado elimine un cobro." />
        <Field label="Código">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <TextField value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 4))} style={{ maxWidth: 160, fontFamily: 'Roboto Mono', fontSize: 22, letterSpacing: 8, textAlign: 'center' }} />
            <button onClick={() => setCode(String(Math.floor(1000 + Math.random() * 9000)))} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.line}`, color: TH.text }}>
              Generar aleatorio
            </button>
          </div>
        </Field>
        <button onClick={saveCode} style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none', alignSelf: 'flex-start' }}>
          Guardar código
        </button>
      </Card>

      <Card pad={24}>
        <SectionHead title="Contraseña de admin" subtitle="Se pide al abrir el panel. Cambiala periódicamente." />
        <Field label="Contraseña actual">
          <TextField value={pwdCurrent} onChange={setPwdCurrent} type="password" placeholder="••••••••" />
        </Field>
        <Field label="Nueva contraseña">
          <TextField value={pwdNew} onChange={setPwdNew} type="password" placeholder="Mínimo 4 caracteres" />
        </Field>
        <Field label="Repetir nueva contraseña">
          <TextField value={pwdNew2} onChange={setPwdNew2} type="password" placeholder="Repetir" />
        </Field>
        <button onClick={savePwd} style={{ ...btnStyle, background: TH.gold, color: '#0E0E10', border: 'none', alignSelf: 'flex-start' }}>
          Cambiar contraseña
        </button>
      </Card>

      <Card pad={24}>
        <SectionHead title="Zona peligrosa" subtitle="Acciones irreversibles." />
        <button onClick={reset} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${TH.red}66`, color: TH.red, alignSelf: 'flex-start' }}>
          <Icon name="trash" size={16} color={TH.red} /> Restaurar valores por defecto
        </button>
      </Card>
    </div>
  );
}

// ─── Primitives ───
function Card({ children, pad = 16, style }) {
  return (
    <div style={{ background: TH.surface, border: `1px solid ${TH.line}`, borderRadius: 16, padding: pad, ...style }}>
      {children}
    </div>
  );
}

function SectionHead({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: TH.textDim, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function Th({ children, align }) {
  return <th style={{ padding: '14px 20px', textAlign: align || 'left', fontSize: 11, color: TH.textMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 500 }}>{children}</th>;
}
function Td({ children, align }) {
  return <td style={{ padding: '12px 20px', textAlign: align || 'left', fontSize: 14, color: TH.text }}>{children}</td>;
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: TH.textDim, marginBottom: 8, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  );
}

function TextField({ value, onChange, type = 'text', placeholder, style }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', height: 48, padding: '0 14px', background: TH.surface2,
        border: `1px solid ${TH.line}`, borderRadius: 12, color: TH.text,
        fontSize: 15, outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box',
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = TH.gold; }}
      onBlur={(e) => { e.target.style.borderColor = TH.line; }}
    />
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', height: 48, padding: '0 14px', background: TH.surface2,
        border: `1px solid ${TH.line}`, borderRadius: 12, color: TH.text,
        fontSize: 15, outline: 'none', cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Switch({ value, onChange, onLabel = 'Sí', offLabel = 'No' }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
      <div style={{ width: 48, height: 28, borderRadius: 999, position: 'relative', background: value ? TH.gold : TH.surface3, border: `1px solid ${value ? TH.gold : TH.line}`, transition: 'all 150ms' }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 22, height: 22, borderRadius: 999, background: value ? '#0E0E10' : TH.textDim, transition: 'left 150ms' }} />
      </div>
      <span style={{ fontSize: 13, color: TH.text, fontWeight: 500 }}>{value ? onLabel : offLabel}</span>
    </button>
  );
}

function ToolBar({ info, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 13, color: TH.textDim }}>{info}</div>
      <div>{actions}</div>
    </div>
  );
}

function FabBtn({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44, padding: '0 20px', borderRadius: 999, background: TH.gold, color: '#0E0E10',
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, letterSpacing: 0.3,
        display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 8px 24px ${TH.gold}44`, whiteSpace: 'nowrap',
      }}
    >
      <Icon name={icon} size={18} color="#0E0E10" /> {label}
    </button>
  );
}

const btnStyle = {
  height: 44, padding: '0 18px', borderRadius: 999, fontSize: 14, fontWeight: 500,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: 0.3,
};

const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 999, background: 'transparent', border: 'none',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4,
};

function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20, animation: 'fadeIn 150ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: TH.surface, borderRadius: 20, border: `1px solid ${TH.line}`,
          width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${TH.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: TH.surface, zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>{title}</div>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="close" size={20} color={TH.textDim} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

function Snackbar({ msg, kind }) {
  const isErr = kind === 'err';
  return (
    <div
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: TH.surface3, border: `1px solid ${isErr ? TH.red : TH.line}`,
        padding: '14px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)', zIndex: 200, animation: 'snackUp 200ms ease-out',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <Icon name={isErr ? 'close' : 'check'} size={18} color={isErr ? TH.red : TH.green} />
      <span style={{ fontSize: 14 }}>{msg}</span>
      <style>{`@keyframes snackUp { from { transform: translate(-50%, 12px); opacity: 0 } to { transform: translate(-50%, 0); opacity: 1 } }`}</style>
    </div>
  );
}

function AdminLogin({ TH: th, adminPassword, onOk }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (pwd === adminPassword) onOk();
    else { setErr(true); setPwd(''); setTimeout(() => setErr(false), 600); }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: th.bg }}>
      <ThemeStyle TH={th} />
      <form
        onSubmit={submit}
        style={{
          width: '100%', maxWidth: 380, padding: 32, background: th.surface,
          border: `1px solid ${th.line}`, borderRadius: th.radius,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          animation: err ? 'shake .4s' : 'none',
        }}
      >
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
        <img src="/logo-v2.png" alt="logo" style={{ width: 110, height: 'auto' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: th.textMute, fontWeight: 700, textTransform: 'uppercase' }}>Acceso restringido</div>
          <div className="th-title" style={{ fontSize: 20, fontWeight: 700, color: th.accent, marginTop: 6, letterSpacing: '0.06em' }}>Panel de admin</div>
        </div>
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Contraseña"
          style={{
            width: '100%', padding: '14px 16px', fontSize: 15, borderRadius: th.radiusSm,
            background: th.surface2, border: `1px solid ${err ? th.red : th.line}`, color: th.text, outline: 'none',
            textAlign: 'center', letterSpacing: 4,
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%', padding: 14, background: th.accent, color: th.accentInk, border: 'none',
            borderRadius: th.radiusSm, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Entrar
        </button>
        <Link to="/cobro" style={{ fontSize: 12, color: th.textDim, textDecoration: 'none' }}>← Volver al cobro</Link>
      </form>
    </div>
  );
}
