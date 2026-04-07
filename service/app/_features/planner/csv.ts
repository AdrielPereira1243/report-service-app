import type { Contact, Entry } from "./model";

export function toCsv(entries: Entry[], contacts: Contact[]) {
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const rows = [
    ["data", "atividade", "horas", "detalhes", "tipo", "nome", "endereco", "assunto"].join(","),
    ...entries.map((e) =>
      (() => {
        const c = e.contactId ? contactMap.get(e.contactId) : undefined;
        return [
          e.date,
          `"${e.activityType}"`,
          e.hours,
          `"${e.details.replaceAll('"', '""')}"`,
          `"${c?.type ?? ""}"`,
          `"${c?.personName?.replaceAll('"', '""') ?? ""}"`,
          `"${c?.address?.replaceAll('"', '""') ?? ""}"`,
          `"${c?.subject?.replaceAll('"', '""') ?? ""}"`,
        ].join(",");
      })(),
    ),
  ];
  return rows.join("\n");
}

export function saveCsv(text: string, fileName: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

