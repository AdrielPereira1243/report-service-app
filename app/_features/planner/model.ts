export type ActivityType =
  | "campo"
  | "cartas"
  | "testemunho informal"
  | "carrinho"
  | "revisita"
  | "estudo";

export type PioneerType =
  | "pioneiro auxiliar 15h"
  | "pioneiro auxiliar 30h"
  | "pioneiro regular"
  | "especial";

export type ContactType = "revisita" | "estudo";

export type Contact = {
  id: string;
  type: ContactType;
  personName: string;
  address: string;
  subject: string;
};

export type Entry = {
  id: string;
  date: string;
  hours: number;
  activityType: ActivityType;
  details: string;
  contactId?: string;
};

export type AppData = {
  pioneerType: PioneerType;
  contacts?: Contact[];
  entries: Entry[];
};

export const STORAGE_KEY = "service-report-data-v1"; // legacy (migração)
export const SQLITE_APPDATA_KEY = "appDataJson.v1";
export const ENTRY_DRAFT_KEY = "service-report-entry-draft-v1";

export const ACTIVITY_TYPES: ActivityType[] = [
  "campo",
  "cartas",
  "testemunho informal",
  "carrinho",
  "revisita",
  "estudo",
];

export const PIONEER_GOALS: Record<PioneerType, number> = {
  "pioneiro auxiliar 15h": 15,
  "pioneiro auxiliar 30h": 30,
  "pioneiro regular": 50,
  especial: 100,
};

export function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function formatHours(v: number) {
  return `${v.toFixed(1)}h`;
}

export function formatMonthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const dt = new Date(year, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function isContactType(x: unknown): x is ContactType {
  return x === "revisita" || x === "estudo";
}

export function isContactActivity(a: ActivityType): a is ContactType {
  return a === "revisita" || a === "estudo";
}

export type LegacyFollowUpInfo = {
  personName?: unknown;
  address?: unknown;
  subject?: unknown;
};

export type LegacyEntry = Entry & {
  followUpType?: unknown;
  followUpInfo?: unknown;
};

