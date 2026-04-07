"use client";

import { useMemo, useState } from "react";
import type { ActivityType, Contact, Entry } from "./model";
import { ACTIVITY_TYPES, isContactActivity } from "./model";

export function Card({
  label,
  value,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn";
  className?: string;
}) {
  const toneClass =
    tone === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "ok"
        ? "text-emerald-600 dark:text-emerald-400"
        : "";
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40",
        className ?? "",
      ].join(" ")}
    >
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

export function EditEntryForm({
  entry,
  contacts,
  onCancel,
  onSave,
}: {
  entry: Entry;
  contacts: Contact[];
  onCancel: () => void;
  onSave: (patch: Partial<Omit<Entry, "id">>) => void;
}) {
  const [date, setDate] = useState(entry.date);
  const [activityType, setActivityType] = useState<ActivityType>(entry.activityType);
  const [hours, setHours] = useState(String(entry.hours));
  const [details, setDetails] = useState(entry.details);
  const [selectedContactId, setSelectedContactId] = useState(entry.contactId ?? "");

  const availableContacts = useMemo(() => {
    if (!isContactActivity(activityType)) return [];
    return contacts.filter((c) => c.type === activityType);
  }, [activityType, contacts]);

  return (
    <div className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/60">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        />
        <select
          value={activityType}
          onChange={(e) => {
            const next = e.target.value as ActivityType;
            setActivityType(next);
            setSelectedContactId("");
          }}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        >
          {ACTIVITY_TYPES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        />
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
          placeholder="Detalhes"
        />
        {isContactActivity(activityType) ? (
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
          >
            <option value="">Selecione {activityType}</option>
            {availableContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.personName || "(sem nome)"}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:ring-indigo-900/40"
        >
          cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            const n = Number(hours);
            if (!date || Number.isNaN(n) || n <= 0) return;
            onSave({
              date,
              activityType,
              hours: n,
              details,
              contactId: isContactActivity(activityType) ? selectedContactId || undefined : undefined,
            });
          }}
          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40"
        >
          salvar
        </button>
      </div>
    </div>
  );
}

export function ContactEditor({
  contact,
  onCancel,
  onSave,
}: {
  contact: Contact;
  onCancel: () => void;
  onSave: (patch: Partial<Omit<Contact, "id">>) => void;
}) {
  const [personName, setPersonName] = useState(contact.personName);
  const [address, setAddress] = useState(contact.address);
  const [subject, setSubject] = useState(contact.subject);

  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/30">
      <input
        value={personName}
        onChange={(e) => setPersonName(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        placeholder="Nome"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        placeholder="Endereco"
      />
      <textarea
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="min-h-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
        placeholder="Assunto"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:ring-indigo-900/40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave({ personName, address, subject })}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

