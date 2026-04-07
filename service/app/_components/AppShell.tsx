"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/60",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              SR
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Service Report</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Relatorio de servico de campo
              </div>
            </div>
          </div>

          <nav className="-mx-2 flex max-w-full items-center gap-2 overflow-x-auto px-2 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:justify-end sm:px-0">
            <NavLink href="/" label="Mês" />
            <NavLink href="/history" label="Historico" />
            <NavLink href="/contacts" label="Pessoas" />
            <NavLink href="/settings" label="Configurações" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-zinc-200/70 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
        Feito para registrar horas mensais.
      </footer>
    </div>
  );
}

