import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchPayload, readCache, writeCache } from "../lib/data";
import { demoPayload } from "../lib/demo";
import { resolveKey } from "../lib/key";
import type { Payload } from "../lib/types";

export type Status = "loading" | "ready" | "error" | "nokey";

interface DataState {
  status: Status;
  payload: Payload | null;
  stale: boolean;
  error: string | null;
  refreshing: boolean;
  demo: boolean;
  reload(): void;
}

const DataContext = createContext<DataState | null>(null);

function isDemo(): boolean {
  if (typeof window === "undefined") return false;
  return new URL(window.location.href).searchParams.get("demo") === "1";
}

export function DataProvider({ children }: { children: ReactNode }) {
  const demo = useMemo(isDemo, []);
  const [status, setStatus] = useState<Status>("loading");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const keyRef = useRef<string | null>(null);

  const load = useCallback(async (initial: boolean) => {
    if (demo) {
      setPayload(demoPayload());
      setStatus("ready");
      return;
    }
    if (initial) {
      const cached = readCache();
      if (cached) {
        setPayload(cached);
        setStale(true);
        setStatus("ready");
      }
    }
    setRefreshing(true);
    try {
      const key = keyRef.current ?? (await resolveKey());
      keyRef.current = key;
      if (!key) {
        setStatus((s) => (s === "ready" ? s : "nokey"));
        return;
      }
      const fresh = await fetchPayload(key);
      writeCache(fresh);
      setPayload(fresh);
      setStale(false);
      setError(null);
      setStatus("ready");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setStatus((s) => (s === "ready" ? s : "error"));
    } finally {
      setRefreshing(false);
    }
  }, [demo]);

  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && !demo) void load(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load, demo]);

  const reload = useCallback(() => {
    void load(false);
  }, [load]);

  const value = useMemo<DataState>(() => ({ status, payload, stale, error, refreshing, demo, reload }), [status, payload, stale, error, refreshing, demo, reload]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("DataProvider missing");
  return ctx;
}
