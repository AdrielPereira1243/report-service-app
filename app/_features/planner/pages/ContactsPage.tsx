"use client";

import { useMemo, useState } from "react";
import { AppShell } from "../../../_components/AppShell";
import type { ContactType } from "../model";
import { UI_BUTTON_PRIMARY, UI_CARD, UI_INPUT } from "../ui";
import { usePlannerData } from "../usePlannerData";
import { ContactEditor } from "../components";

export function ContactsPage() {
  const data = usePlannerData();
  const [filter, setFilter] = useState<ContactType>("estudo");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.contacts
      .filter((c) => c.type === filter)
      .filter((c) => {
        if (!q) return true;
        return (
          c.personName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.personName.localeCompare(b.personName));
  }, [data.contacts, filter, query]);

  const countUsedById = useMemo(() => {
    const map = new Map<string, number>();
    data.entries.forEach((e) => {
      if (!e.contactId) return;
      map.set(e.contactId, (map.get(e.contactId) ?? 0) + 1);
    });
    return map;
  }, [data.entries]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Gerencie seus estudos e revisitas (nome, endereco, assunto).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("estudo")}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === "estudo"
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              Estudos
            </button>
            <button
              type="button"
              onClick={() => setFilter("revisita")}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === "revisita"
                  ? "bg-sky-600 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              Revisitas
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, endereco ou assunto..."
            className={`w-full md:max-w-md ${UI_INPUT}`}
          />
          <a href={`/follow-up?type=${filter}`} className={UI_BUTTON_PRIMARY}>
            + Novo {filter}
          </a>
        </div>

        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className={`${UI_CARD} text-sm text-zinc-500`}>
              Nenhum {filter} cadastrado ainda.
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className={UI_CARD}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{c.personName || "(sem nome)"}</div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {c.subject || "(sem assunto)"}
                    </div>
                    {c.address ? <div className="mt-1 text-xs text-zinc-500">{c.address}</div> : null}
                    <div className="mt-2 text-xs text-zinc-500">
                      Usado em {countUsedById.get(c.id) ?? 0} lancamento(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === c.id ? null : c.id)}
                      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const used = countUsedById.get(c.id) ?? 0;
                        const ok = window.confirm(
                          used > 0
                            ? `Remover este ${filter}? Ele esta vinculado a ${used} lancamento(s). Os lancamentos vao continuar, mas sem pessoa vinculada.`
                            : `Remover este ${filter}?`,
                        );
                        if (!ok) return;
                        data.deleteContact(c.id);
                        if (editingId === c.id) setEditingId(null);
                      }}
                      className="rounded-full border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      remover
                    </button>
                  </div>
                </div>
                {editingId === c.id ? (
                  <ContactEditor
                    contact={c}
                    onCancel={() => setEditingId(null)}
                    onSave={(patch) => {
                      data.updateContact(c.id, patch);
                      setEditingId(null);
                    }}
                  />
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

