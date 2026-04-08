"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../_components/AppShell";
import { toCsv, saveCsv } from "../csv";
import {
  ACTIVITY_TYPES,
  PIONEER_GOALS,
  formatHours,
  formatMonthLabel,
  getCurrentMonth,
  getTodayIso,
  isContactActivity,
  type ActivityType,
  type Entry,
} from "../model";
import { UI_BUTTON_PRIMARY, UI_BUTTON_SECONDARY, UI_CARD, UI_INPUT } from "../ui";
import { Card, EditEntryForm } from "../components";
import { ENTRY_DRAFT_KEY } from "../model";
import { usePlannerData } from "../usePlannerData";

export function DashboardPage() {
  const router = useRouter();
  const data = usePlannerData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [date, setDate] = useState(getTodayIso());
  const [activityType, setActivityType] = useState<ActivityType>("campo");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [hours, setHours] = useState("8");
  const [editingId, setEditingId] = useState<string | null>(null);
  const isContactMode = isContactActivity(activityType);

  const contactsForSelectedType = useMemo(() => {
    if (!isContactMode) return [];
    return data.contacts.filter((c) => c.type === activityType);
  }, [activityType, data.contacts, isContactMode]);

  const monthEntries = useMemo(
    () => data.entries.filter((e) => e.date.startsWith(month)),
    [data.entries, month],
  );

  const totalHours = monthEntries.reduce((acc, e) => acc + e.hours, 0);
  const goal = PIONEER_GOALS[data.pioneerType];
  const progress = goal > 0 ? (totalHours / goal) * 100 : 0;
  // Status baseado no ritmo do mês usando a média de dias por mês no ano.
  // média ≈ 365.2425 / 12 = 30.436875
  const AVG_DAYS_PER_MONTH = 365.2425 / 12;
  const currentMonth = getCurrentMonth();
  const todayDay = new Date().getDate(); // 1..31
  const elapsedDays =
    month === currentMonth ? Math.min(todayDay, AVG_DAYS_PER_MONTH) : month < currentMonth ? AVG_DAYS_PER_MONTH : 0;
  const expectedHoursSoFar = goal > 0 ? (goal * elapsedDays) / AVG_DAYS_PER_MONTH : 0;
  const delta = totalHours - expectedHoursSoFar;
  const isLate = delta < -0.25; // tolerância pequena pra não ficar "piscando"
  const isAhead = delta > 0.25;
  const daysWithEntries = new Set(monthEntries.map((e) => e.date)).size;

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    monthEntries.forEach((e) => {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, [monthEntries]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Relatorio de servico de campo</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Registre horas dedicadas ao servico e acompanhe seu mes.
            </p>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`w-full sm:w-auto ${UI_INPUT}`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card label="Total no mes" value={formatHours(totalHours)} />
          <Card label="Dias com lancamento" value={String(daysWithEntries)} />
          <Card label="Meta mensal" value={formatHours(goal)} />
          <Card
            label="Status"
            value={
              month > currentMonth
                ? "Planejado"
                : isLate
                  ? `Atrasado (${formatHours(Math.abs(delta))})`
                  : isAhead
                    ? `Adiantado (${formatHours(delta)})`
                    : "Em dia"
            }
            tone={isLate ? "warn" : "ok"}
          />
        </div>

        <section className={UI_CARD}>
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
              <span>{formatMonthLabel(month)}</span>
              <span>{Math.min(100, progress).toFixed(0)}% da meta</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={["h-2 rounded-full", isLate ? "bg-amber-500" : "bg-indigo-500"].join(" ")}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>

          <h2 className="text-sm font-semibold">Novo lancamento</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={UI_INPUT} />
            <select
              value={activityType}
              onChange={(e) => {
                const next = e.target.value as ActivityType;
                setActivityType(next);
                setSelectedContactId("");
              }}
              className={UI_INPUT}
            >
              {ACTIVITY_TYPES.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={UI_INPUT}
              placeholder="Horas"
            />
            <button
              type="button"
              onClick={() => {
                const n = Number(hours);
                if (!date || !activityType || Number.isNaN(n) || n <= 0) return;
                if (isContactMode) {
                  const available = data.contacts.filter((c) => c.type === activityType);
                  if (available.length === 0 || !selectedContactId) {
                    window.localStorage.setItem(
                      ENTRY_DRAFT_KEY,
                      JSON.stringify({
                        date,
                        hours: n,
                        activityType,
                      }),
                    );
                    router.push(`/follow-up?type=${activityType}`);
                    return;
                  }

                  data.addEntry({
                    date,
                    activityType,
                    hours: n,
                    details: "",
                    contactId: selectedContactId,
                  });
                  return;
                }

                data.addEntry({ date, activityType, hours: n, details: "" });
              }}
              className={`${UI_BUTTON_PRIMARY} sm:col-span-2 lg:col-span-1`}
            >
              Salvar
            </button>
          </div>
          {isContactMode ? (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="mb-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                Vinculo de {activityType}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className={`${UI_INPUT} sm:col-span-2 lg:col-span-3 dark:focus:border-blue-500 dark:focus:ring-blue-900/50 focus:border-blue-400 focus:ring-blue-200`}
                >
                  <option value="">Selecione {activityType}</option>
                  {contactsForSelectedType.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.personName || "(sem nome)"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const n = Number(hours);
                    if (!date || Number.isNaN(n) || n <= 0) return;
                    window.localStorage.setItem(
                      ENTRY_DRAFT_KEY,
                      JSON.stringify({
                        date,
                        hours: n,
                        activityType,
                      }),
                    );
                    router.push(`/follow-up?type=${activityType}`);
                  }}
                  className={`${UI_BUTTON_SECONDARY} sm:col-span-2 lg:col-span-2`}
                >
                  + Criar novo {activityType}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className={UI_CARD}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Lancamentos do mes</h2>
            <button
              type="button"
              onClick={() => saveCsv(toCsv(monthEntries, data.contacts), `servico-${month}.csv`)}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Exportar CSV
            </button>
          </div>
          <div className="grid gap-3">
            {groupedByDate.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem registros neste mes.</p>
            ) : (
              groupedByDate.map(([d, list]) => (
                <div
                  key={d}
                  className="rounded-xl border border-zinc-200 p-3 shadow-sm dark:border-zinc-800"
                >
                  <div className="mb-2 text-xs font-medium text-zinc-500">{d}</div>
                  <div className="grid gap-2">
                    {list.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/80"
                      >
                        <div>
                          <div className="font-medium">{e.activityType}</div>
                          {e.contactId ? (
                            <div className="text-xs text-zinc-600 dark:text-zinc-300">
                              {data.contacts.find((c) => c.id === e.contactId)?.personName}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <div>{formatHours(e.hours)}</div>
                          <button
                            type="button"
                            onClick={() => setEditingId(editingId === e.id ? null : e.id)}
                            className="text-xs text-zinc-600 hover:underline dark:text-zinc-300"
                          >
                            editar
                          </button>
                          <button
                            type="button"
                            onClick={() => data.deleteEntry(e.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            remover
                          </button>
                        </div>
                      </div>
                    ))}
                    {list.map((e) =>
                      editingId === e.id ? (
                        <EditEntryForm
                          key={`${e.id}-edit`}
                          entry={e}
                          contacts={data.contacts}
                          onCancel={() => setEditingId(null)}
                          onSave={(patch) => {
                            data.updateEntry(e.id, patch);
                            setEditingId(null);
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

