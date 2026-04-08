"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "../../../_components/AppShell";
import { ENTRY_DRAFT_KEY, isContactType } from "../model";
import type { ActivityType, ContactType } from "../model";
import { formatHours } from "../model";
import { UI_BUTTON_PRIMARY, UI_BUTTON_SECONDARY, UI_CARD, UI_INPUT } from "../ui";
import { usePlannerData } from "../usePlannerData";

export function FollowUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = usePlannerData();

  const queryType = searchParams.get("type");
  const contactType: ContactType = isContactType(queryType) ? queryType : "revisita";

  const draft = useMemo(() => {
    const raw = window.localStorage.getItem(ENTRY_DRAFT_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        date: string;
        hours: number;
        activityType: ActivityType;
        details?: string;
      };
      if (!parsed?.date || !parsed?.hours || !parsed?.activityType) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const [personName, setPersonName] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("");

  const canSave =
    personName.trim().length > 0 || address.trim().length > 0 || subject.trim().length > 0;

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cadastrar {contactType}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Salve nome, endereço e um lembrete do assunto para a próxima conversa.
            </p>
          </div>
          <div
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium",
              contactType === "estudo"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
            ].join(" ")}
          >
            {contactType === "estudo" ? "Estudo" : "Revisita"}
          </div>
        </div>

        <div className={UI_CARD}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {draft ? (
              <div className="text-xs text-zinc-600 dark:text-zinc-300">
                Lançamento pendente: <strong>{draft.date}</strong> —{" "}
                <strong>{formatHours(draft.hours)}</strong>
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                Você também pode cadastrar pessoas sem lançar horas agora.
              </div>
            )}
            {draft ? (
              <div className="text-[11px] text-zinc-500">
                Ao salvar, vamos vincular automaticamente este contato ao lançamento.
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Nome</label>
              <input
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ex.: Maria"
                className={UI_INPUT}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Endereço (opcional)
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, referência..."
                className={UI_INPUT}
              />
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Assunto / lembrete
              </label>
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex.: Tema sobre sofrimento, combinar retorno na terça..."
                className={`min-h-32 ${UI_INPUT}`}
              />
              <p className="text-[11px] text-zinc-500">
                Dica: escreva algo curto que ajude a retomar a conversa na próxima visita.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={() => router.push("/")} className={UI_BUTTON_SECONDARY}>
              Voltar
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                const id = data.addContact({
                  type: contactType,
                  personName,
                  address,
                  subject,
                });

                const raw = window.localStorage.getItem(ENTRY_DRAFT_KEY);
                if (raw) {
                  try {
                    const parsed = JSON.parse(raw) as {
                      date: string;
                      hours: number;
                      activityType: ActivityType;
                      details?: string;
                    };
                    data.addEntry({
                      date: parsed.date,
                      hours: parsed.hours,
                      activityType: contactType,
                      details: parsed.details ?? "",
                      contactId: id,
                    });
                    window.localStorage.removeItem(ENTRY_DRAFT_KEY);
                  } catch {
                    // ignore
                  }
                }

                router.push("/");
              }}
              className={[UI_BUTTON_PRIMARY, !canSave ? "opacity-50 pointer-events-none" : ""].join(
                " ",
              )}
            >
              Salvar {contactType}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

