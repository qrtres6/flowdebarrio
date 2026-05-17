// Small indicator showing whether data is syncing to the cloud (Supabase).
import { Icon } from '../lib/icons.jsx';

const MAP = {
  local: { icon: 'cloud-off', label: 'Solo este dispositivo', color: 'textMute' },
  syncing: { icon: 'cloud', label: 'Sincronizando…', color: 'textDim' },
  synced: { icon: 'cloud', label: 'Sincronizado', color: 'green' },
  offline: { icon: 'cloud-off', label: 'Sin conexión', color: 'red' },
};

export default function SyncBadge({ status, TH }) {
  const cfg = MAP[status] || MAP.local;
  const color = TH[cfg.color] || TH.textDim;
  return (
    <div
      title={cfg.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 999,
        border: `1px solid ${TH.line}`, background: TH.surface,
        fontSize: 11, color, whiteSpace: 'nowrap',
      }}
    >
      <Icon name={cfg.icon} size={14} color={color} />
      <span style={{ fontWeight: 500 }}>{cfg.label}</span>
    </div>
  );
}
