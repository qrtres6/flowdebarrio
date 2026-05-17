// Default data + static catalogs.

export const DEFAULT_STATE = {
  shopName: 'Mi Barbería',
  adminPassword: 'flow2026',
  services: [
    { id: 's1', name: 'Corte clásico', price: 6000, icon: 'scissors' },
    { id: 's2', name: 'Barba', price: 4500, icon: 'razor' },
    { id: 's3', name: 'Corte + Barba', price: 9500, icon: 'combo' },
    { id: 's4', name: 'Tinte', price: 12000, icon: 'tint' },
    { id: 's5', name: 'Lavado', price: 2500, icon: 'wash' },
    { id: 's6', name: 'Diseño', price: 3500, icon: 'design' },
    { id: 's7', name: 'Cejas', price: 2000, icon: 'brow' },
    { id: 's8', name: 'Corte niño', price: 5000, icon: 'kid' },
  ],
  employees: [
    { id: 'e1', name: 'Mateo Ramírez', role: 'Barbero senior', active: true, startDate: '2023-04-12', color: '#B8893E', commissionPct: 50 },
    { id: 'e2', name: 'Lucas Vidal', role: 'Barbero', active: true, startDate: '2024-02-03', color: '#6E8E63', commissionPct: 45 },
    { id: 'e3', name: 'Diego Ferraro', role: 'Barbero', active: true, startDate: '2024-08-19', color: '#8B5E3C', commissionPct: 50 },
    { id: 'e4', name: 'Sofía Bianchi', role: 'Estilista', active: false, startDate: '2025-01-08', color: '#A56CB8', commissionPct: 55 },
  ],
  approvalCode: '4827',
  // Currently open shifts (one per active employee at most)
  openShifts: {}, // empId -> { id, empId, startTime, entries: [...] }
  // Closed shifts history
  shifts: [], // { id, empId, empName, commissionPct, startTime, endTime, entries, total, empCut, shopCut }
  expenses: [], // { id, category, amount, date, note }
  expenseCategories: ['Alquiler', 'Servicios', 'Insumos', 'Otros'],
};

export const PAY_METHODS = [
  { id: 'cash', name: 'Efectivo', icon: 'cash' },
  { id: 'card', name: 'Tarjeta', icon: 'card' },
  { id: 'transfer', name: 'Transferencia', icon: 'transfer' },
  { id: 'qr', name: 'QR / MP', icon: 'qr' },
];

export const ICON_OPTIONS = [
  'scissors', 'razor', 'combo', 'tint', 'wash', 'design', 'brow', 'kid', 'sparkle', 'beard', 'massage', 'flame',
];
