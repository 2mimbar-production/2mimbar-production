/** Kerangka halaman masuk / lupa password / password baru. */
export default function AuthShell({
  judul,
  sub,
  children,
}: {
  judul: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white lg:flex">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url(/hero-duamimbar.jpg)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-brand-900/40" />
        <div className="relative flex items-center gap-3">
          <img src="/logo-white.png" alt="" className="h-9 w-auto" />
          <span className="font-display text-2xl">Duamimbar</span>
        </div>
        <div className="relative">
          <p className="font-mono text-meta uppercase text-white/60">Studio Produksi</p>
          <p className="font-display mt-4 max-w-lg text-6xl leading-[0.95]">Program, jadwal, dan episode tayang di satu tempat.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex h-11 w-11 items-center justify-center rounded bg-brand lg:hidden">
            <img src="/logo-white.png" alt="Duamimbar" className="h-6 w-auto" />
          </div>
          <h1 className="font-display text-[2.5rem] leading-none text-ink">{judul}</h1>
          <p className="mb-8 mt-3 text-sm text-ink-3">{sub}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
