"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sqliteGetKv, sqliteSetKv } from "../../_lib/sqliteClient";
import type { AppData, Contact, Entry, PioneerType } from "./model";
import {
  SQLITE_APPDATA_KEY,
  STORAGE_KEY,
  type LegacyEntry,
  type LegacyFollowUpInfo,
  type ContactType,
} from "./model";

export function usePlannerData() {
  const defaults = useMemo(() => {
    const nextDefaults = {
      pioneerType: "pioneiro auxiliar 15h" as PioneerType,
      contacts: [] as Contact[],
      entries: [] as Entry[],
    };
    return nextDefaults;
  }, []);

  const [pioneerType, setPioneerType] = useState<PioneerType>(defaults.pioneerType);
  const [contacts, setContacts] = useState<Contact[]>(defaults.contacts);
  const [entries, setEntries] = useState<Entry[]>(defaults.entries);

  const didHydrateRef = useRef(false);
  const hasLocalChangesRef = useRef(false);
  const pendingSnapshotRef = useRef<{
    pioneerType: PioneerType;
    contacts: Contact[];
    entries: Entry[];
  } | null>(null);

  // Refs para evitar "stale state" quando várias operações acontecem no mesmo tick
  const pioneerTypeRef = useRef<PioneerType>(pioneerType);
  const contactsRef = useRef<Contact[]>(contacts);
  const entriesRef = useRef<Entry[]>(entries);

  useEffect(() => {
    pioneerTypeRef.current = pioneerType;
    contactsRef.current = contacts;
    entriesRef.current = entries;
  }, [pioneerType, contacts, entries]);

  const normalizeLegacy = (parsed: AppData & { entries?: LegacyEntry[] }) => {
    const nextPioneer = parsed.pioneerType ?? defaults.pioneerType;
    let nextContacts = parsed.contacts ?? defaults.contacts;
    let nextEntries: Entry[] = [];

    if (parsed.entries) {
      nextEntries = parsed.entries.map((e: LegacyEntry) => {
        const legacyType = e.followUpType;
        const legacyInfo = e.followUpInfo;

        if (
          legacyInfo &&
          typeof legacyInfo === "object" &&
          legacyType &&
          (legacyType === "revisita" || legacyType === "estudo biblico")
        ) {
          const info = legacyInfo as LegacyFollowUpInfo;
          const type: ContactType = legacyType === "estudo biblico" ? "estudo" : "revisita";
          const id = crypto.randomUUID();
          nextContacts = [
            ...nextContacts,
            {
              id,
              type,
              personName: String(info.personName ?? ""),
              address: String(info.address ?? ""),
              subject: String(info.subject ?? ""),
            },
          ];
          return {
            id: e.id,
            date: e.date,
            hours: e.hours,
            activityType: type,
            details: e.details ?? "",
            contactId: id,
          };
        }

        return {
          id: e.id,
          date: e.date,
          hours: e.hours,
          activityType: e.activityType,
          details: e.details ?? "",
          contactId: e.contactId,
        };
      });
    }

    return { pioneerType: nextPioneer, contacts: nextContacts, entries: nextEntries };
  };

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const raw = await sqliteGetKv(SQLITE_APPDATA_KEY);
        if (raw) {
          if (!hasLocalChangesRef.current) {
            const parsed = JSON.parse(raw) as AppData & { entries?: LegacyEntry[] };
            const next = normalizeLegacy(parsed);
            if (cancelled) return;
            pioneerTypeRef.current = next.pioneerType;
            contactsRef.current = next.contacts;
            entriesRef.current = next.entries;
            setPioneerType(next.pioneerType);
            setContacts(next.contacts);
            setEntries(next.entries);
          }
          didHydrateRef.current = true;
          return;
        }

        // Migra do LocalStorage legado (se existir)
        const legacy = window.localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy) as AppData & { entries?: LegacyEntry[] };
          const next = normalizeLegacy(parsed);
          await sqliteSetKv(SQLITE_APPDATA_KEY, JSON.stringify(next));
          window.localStorage.removeItem(STORAGE_KEY);
          if (!hasLocalChangesRef.current) {
            if (cancelled) return;
            pioneerTypeRef.current = next.pioneerType;
            contactsRef.current = next.contacts;
            entriesRef.current = next.entries;
            setPioneerType(next.pioneerType);
            setContacts(next.contacts);
            setEntries(next.entries);
          }
          didHydrateRef.current = true;
        }
      } catch {
        didHydrateRef.current = true;
      } finally {
        if (!didHydrateRef.current) didHydrateRef.current = true;

        if (
          !cancelled &&
          didHydrateRef.current &&
          hasLocalChangesRef.current &&
          pendingSnapshotRef.current
        ) {
          const snap = pendingSnapshotRef.current;
          pendingSnapshotRef.current = null;
          void sqliteSetKv(
            SQLITE_APPDATA_KEY,
            JSON.stringify({
              pioneerType: snap.pioneerType,
              contacts: snap.contacts,
              entries: snap.entries,
            }),
          );
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (nextPioneerType: PioneerType, nextContacts: Contact[], nextEntries: Entry[]) => {
    if (!didHydrateRef.current) {
      hasLocalChangesRef.current = true;
      pendingSnapshotRef.current = {
        pioneerType: nextPioneerType,
        contacts: nextContacts,
        entries: nextEntries,
      };
      return;
    }
    void sqliteSetKv(
      SQLITE_APPDATA_KEY,
      JSON.stringify({
        pioneerType: nextPioneerType,
        contacts: nextContacts,
        entries: nextEntries,
      }),
    );
  };

  return {
    pioneerType,
    contacts,
    entries,
    setPioneerType(nextType: PioneerType) {
      pioneerTypeRef.current = nextType;
      setPioneerType(nextType);
      persist(nextType, contactsRef.current, entriesRef.current);
    },
    addContact(input: Omit<Contact, "id">) {
      const id = crypto.randomUUID();
      const next = [...contactsRef.current, { ...input, id }];
      contactsRef.current = next;
      setContacts(next);
      persist(pioneerTypeRef.current, next, entriesRef.current);
      return id;
    },
    updateContact(id: string, patch: Partial<Omit<Contact, "id">>) {
      const next = contactsRef.current.map((c) => (c.id === id ? { ...c, ...patch } : c));
      contactsRef.current = next;
      setContacts(next);
      persist(pioneerTypeRef.current, next, entriesRef.current);
    },
    deleteContact(id: string) {
      const nextContacts = contactsRef.current.filter((c) => c.id !== id);
      const nextEntries = entriesRef.current.map((e) =>
        e.contactId === id ? { ...e, contactId: undefined } : e,
      );
      contactsRef.current = nextContacts;
      entriesRef.current = nextEntries;
      setContacts(nextContacts);
      setEntries(nextEntries);
      persist(pioneerTypeRef.current, nextContacts, nextEntries);
    },
    addEntry(input: Omit<Entry, "id">) {
      const id = crypto.randomUUID();
      const next = [...entriesRef.current, { ...input, id }];
      entriesRef.current = next;
      setEntries(next);
      persist(pioneerTypeRef.current, contactsRef.current, next);
      return id;
    },
    updateEntry(id: string, patch: Partial<Omit<Entry, "id">>) {
      const next = entriesRef.current.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      );
      entriesRef.current = next;
      setEntries(next);
      persist(pioneerTypeRef.current, contactsRef.current, next);
    },
    deleteEntry(id: string) {
      const next = entriesRef.current.filter((x) => x.id !== id);
      entriesRef.current = next;
      setEntries(next);
      persist(pioneerTypeRef.current, contactsRef.current, next);
    },
    clearAll() {
      pioneerTypeRef.current = "pioneiro auxiliar 15h";
      contactsRef.current = [];
      entriesRef.current = [];
      setPioneerType("pioneiro auxiliar 15h");
      setContacts([]);
      setEntries([]);
      persist("pioneiro auxiliar 15h", [], []);
    },
  };
}

