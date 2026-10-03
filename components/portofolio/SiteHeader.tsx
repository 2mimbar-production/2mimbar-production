import Link from "next/link";

/** Header situs publik. `overlay` = transparan di atas hero; selain itu bidang denim. */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`${overlay ? "absolute" : "relative bg-brand-900"} inset-x-0 top-0 z-20 text-white`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-white.png" alt="" className="h-8 w-auto" />
          <span className="leading-none">
            <span className="font-display block text-xl">Duamimbar</span>
            <span className="mt-1 hidden font-mono text-meta uppercase text-white/60 sm:block">Divisi Produksi</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/#karya" className="rounded px-2.5 py-2 text-white/80 hover:text-white">
            Karya
          </Link>
          <Link href="/#kontak" className="rounded px-2.5 py-2 text-white/80 hover:text-white">
            Kontak
          </Link>
          <Link
            href="/studio"
            className="ml-1 rounded border border-white/35 px-3 py-1.5 font-medium transition-colors hover:border-white hover:bg-white hover:text-brand-900"
          >
            Studio
          </Link>
        </nav>
      </div>
    </header>
  );
}
