// Shared app store.
// - Always keeps a localStorage cache so the app works offline / without Supabase.
// - When Supabase is configured, the whole state is mirrored to a single row
//   (`app_state`) and kept in sync across devices via Realtime.
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_STATE } from './constants.js';
import { supabase, supabaseEnabled, STATE_ROW_ID } from './supabase.js';

const STORE_KEY = 'tijera.store.v3';

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveLocal(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// status: 'local' | 'syncing' | 'synced' | 'offline'
export function useStore() {
  const [state, setStateRaw] = useState(loadLocal);
  const [status, setStatus] = useState(supabaseEnabled ? 'syncing' : 'local');
  const lastSyncedJson = useRef(null);
  const pushTimer = useRef(null);

  // ── Push the full state to Supabase (debounced) ──
  const pushRemote = useCallback((next) => {
    if (!supabaseEnabled) return;
    const json = JSON.stringify(next);
    if (json === lastSyncedJson.current) return;
    clearTimeout(pushTimer.current);
    setStatus('syncing');
    pushTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from('app_state')
        .upsert({ id: STATE_ROW_ID, data: next, updated_at: new Date().toISOString() });
      if (error) {
        setStatus('offline');
      } else {
        lastSyncedJson.current = json;
        setStatus('synced');
      }
    }, 500);
  }, []);

  // ── Initial remote load + realtime subscription ──
  useEffect(() => {
    if (!supabaseEnabled) {
      function onStorage(e) {
        if (e.key === STORE_KEY && e.newValue) {
          try { setStateRaw(JSON.parse(e.newValue)); } catch { /* ignore */ }
        }
      }
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('app_state')
        .select('data')
        .eq('id', STATE_ROW_ID)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setStatus('offline');
        return;
      }

      if (data && data.data) {
        const merged = { ...DEFAULT_STATE, ...data.data };
        lastSyncedJson.current = JSON.stringify(data.data);
        setStateRaw(merged);
        saveLocal(merged);
        setStatus('synced');
      } else {
        // First run: seed the remote row with whatever we have locally.
        const seed = loadLocal();
        const { error: seedErr } = await supabase
          .from('app_state')
          .upsert({ id: STATE_ROW_ID, data: seed, updated_at: new Date().toISOString() });
        if (!cancelled) {
          if (seedErr) {
            setStatus('offline');
          } else {
            lastSyncedJson.current = JSON.stringify(seed);
            setStatus('synced');
          }
        }
      }
    })();

    const channel = supabase
      .channel('app_state_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: `id=eq.${STATE_ROW_ID}` },
        (payload) => {
          const incoming = payload.new && payload.new.data;
          if (!incoming) return;
          const json = JSON.stringify(incoming);
          if (json === lastSyncedJson.current) return; // our own echo
          lastSyncedJson.current = json;
          const merged = { ...DEFAULT_STATE, ...incoming };
          setStateRaw(merged);
          saveLocal(merged);
          setStatus('synced');
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const setState = useCallback(
    (updater) => {
      setStateRaw((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveLocal(next);
        pushRemote(next);
        return next;
      });
    },
    [pushRemote]
  );

  return [state, setState, status];
}
