"use client";

import { AppShell } from "../../../_components/AppShell";
import { PIONEER_GOALS, type PioneerType, formatHours } from "../model";
import { UI_CARD, UI_INPUT } from "../ui";
import { usePlannerData } from "../usePlannerData";

export function SettingsPage() {
  const data = usePlannerData();
  return (
    <AppShell>
      <div className="grid max-w-xl gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Defina seu tipo de pioneiro e acompanhe meta mensal.
          </p>
        </div>
        <div className={UI_CARD}>
          <h2 className="text-sm font-semibold">Tipo de pioneiro</h2>
          <select
            value={data.pioneerType}
            onChange={(e) => data.setPioneerType(e.target.value as PioneerType)}
            className={`mt-3 w-full ${UI_INPUT}`}
          >
            <option value="pioneiro auxiliar 15h">Pioneiro auxiliar - 15 horas</option>
            <option value="pioneiro auxiliar 30h">Pioneiro auxiliar - 30 horas</option>
            <option value="pioneiro regular">Pioneiro regular - 50 horas</option>
            <option value="especial">Especial - 100 horas</option>
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            Meta atual: {formatHours(PIONEER_GOALS[data.pioneerType])} por mes.
          </p>
        </div>
        <div className={UI_CARD}>
          <h2 className="text-sm font-semibold">Dados locais</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Seus dados ficam salvos no navegador deste dispositivo.
          </p>
          <button
            type="button"
            onClick={() => data.clearAll()}
            className="mt-4 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Limpar todos os dados
          </button>
        </div>
      </div>
    </AppShell>
  );
}

