"use client";

import { useMemo } from "react";
import { AppShell } from "../../../_components/AppShell";
import { formatHours, formatMonthLabel, PIONEER_GOALS } from "../model";
import { UI_CARD } from "../ui";
import { usePlannerData } from "../usePlannerData";

export function MonthlyHistoryPage() {
  const data = usePlannerData();
  const monthlyRows = useMemo(() => {
    const map = new Map<string, { hours: number }[]>();
    data.entries.forEach((entry) => {
      const key = entry.date.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push({ hours: entry.hours });
      map.set(key, list);
    });

    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([month, list]) => {
        const total = list.reduce((acc, e) => acc + e.hours, 0);
        const goal = PIONEER_GOALS[data.pioneerType];
        return { month, total, goal, remaining: Math.max(0, goal - total) };
      });
  }, [data.entries, data.pioneerType]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Historico mensal</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Veja o consolidado de cada mes, com totais e status da meta.
          </p>
        </div>
        <div className="grid gap-2">
          {monthlyRows.length === 0 ? (
            <div className={`${UI_CARD} text-sm text-zinc-500`}>Nenhum mes registrado ainda.</div>
          ) : (
            monthlyRows.map((row) => (
              <div key={row.month} className={UI_CARD}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{formatMonthLabel(row.month)}</div>
                  <div
                    className={[
                      "rounded-full px-2 py-1 text-xs font-medium",
                      row.remaining > 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                    ].join(" ")}
                  >
                    {row.remaining > 0 ? `Atrasado ${formatHours(row.remaining)}` : "Meta concluida"}
                  </div>
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Total: <strong>{formatHours(row.total)}</strong> / Meta:{" "}
                  <strong>{formatHours(row.goal)}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

