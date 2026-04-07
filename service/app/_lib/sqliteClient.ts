// SQLite local no navegador (via sql.js em modo ASM) com persistência em IndexedDB.
// - Não depende de servidor
// - Persiste o arquivo do banco por usuário/dispositivo

import initSqlJs from "sql.js/dist/sql-asm.js";

type SqlJsDatabase = {
  exec: (sql: string, params?: unknown[]) => unknown[];
  run: (sql: string, params?: unknown[]) => void;
  prepare: (sql: string) => {
    bind: (params?: unknown[]) => void;
    step: () => boolean;
    getAsObject: () => Record<string, unknown>;
    free: () => void;
  };
  export: () => Uint8Array;
  close: () => void;
};

const IDB_DB = "service-report";
const IDB_STORE = "sqlite";
const IDB_KEY = "service-report.sqlite.v1";

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetBytes(): Promise<Uint8Array | null> {
  const db = await openIdb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        const val = req.result as ArrayBuffer | Uint8Array | undefined;
        if (!val) return resolve(null);
        if (val instanceof Uint8Array) return resolve(val);
        return resolve(new Uint8Array(val));
      };
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbSetBytes(bytes: Uint8Array): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      // Salva como ArrayBuffer para compatibilidade.
      const req = store.put(bytes.buffer, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

let singleton:
  | {
      db: SqlJsDatabase;
      flushTimer: number | null;
    }
  | null = null;

export async function getSqliteDb(): Promise<SqlJsDatabase> {
  if (typeof window === "undefined") {
    throw new Error("SQLite local só pode ser usado no browser.");
  }
  if (singleton) return singleton.db;

  const SQL = await initSqlJs({
    // sql-asm não precisa de wasm
  });

  const existing = await idbGetBytes();
  const db = new SQL.Database(existing ?? undefined) as unknown as SqlJsDatabase;

  db.run("PRAGMA journal_mode=MEMORY;");
  db.run("PRAGMA synchronous=OFF;");
  db.run("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);");

  singleton = { db, flushTimer: null };
  return db;
}

export async function sqliteSetKv(key: string, value: string): Promise<void> {
  const db = await getSqliteDb();
  db.run("INSERT INTO kv(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value;", [
    key,
    value,
  ]);
  scheduleFlush();
}

export async function sqliteGetKv(key: string): Promise<string | null> {
  const db = await getSqliteDb();
  const stmt = db.prepare("SELECT value FROM kv WHERE key = ? LIMIT 1;");
  try {
    stmt.bind([key]);
    if (!stmt.step()) return null;
    const row = stmt.getAsObject() as { value?: unknown };
    return typeof row.value === "string" ? row.value : null;
  } finally {
    stmt.free();
  }
}

function scheduleFlush() {
  if (!singleton) return;
  if (singleton.flushTimer) window.clearTimeout(singleton.flushTimer);
  singleton.flushTimer = window.setTimeout(() => {
    void flushToIdb();
  }, 300);
}

export async function flushToIdb(): Promise<void> {
  if (!singleton) return;
  const bytes = singleton.db.export();
  await idbSetBytes(bytes);
}

