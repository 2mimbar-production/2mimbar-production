"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clapperboard, FolderKanban, LayoutDashboard, NotebookPen, ArrowUpRight } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/studio", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/studio/proyek", label: "Program", icon: FolderKanban },
  { href: "/studio/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/studio/laporan", label: "Laporan", icon: NotebookPen },
  { href: "/studio/portofolio", label: "Portofolio", icon: Clapperboard },
];

function aktif(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);
}

function Merek({ kecil = false }: { kecil?: boolean }) {
  return (
    <Link href="/studio" className="flex items-center gap-3">
      <img src="/logo-white.png" alt="" className={kecil ? "h-6 w-auto" : "h-8 w-auto"} />
      <span className="leading-none">
        <span className="font-display block text-lg text-white">Duamimbar</span>
        {!kecil && <span className="mt-1 block font-mono text-meta uppercase text-white/50">Studio Produksi</span>}
      </span>
    </Link>
  );
}

export default function StudioNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* iPad & desktop: sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-brand-900 text-white md:flex print:hidden">
        <div className="px-5 pb-8 pt-6">
          <Merek />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = aktif(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                  on ? "bg-white font-medium text-brand-900" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={on ? 2 : 1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            Lihat situs publik <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-4">
          <p className="truncate font-mono text-xs text-white/50">{email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* HP: bar atas untuk merek, bar bawah untuk navigasi */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-900 px-4 py-3 md:hidden print:hidden">
        <Merek kecil />
        <LogoutButton />
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-brand-900 pb-[env(safe-area-inset-bottom)] md:hidden print:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = aktif(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] ${on ? "text-white" : "text-white/55"}`}
            >
              {on && <span className="absolute inset-x-4 top-0 h-0.5 bg-white" />}
              <Icon size={20} strokeWidth={on ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
