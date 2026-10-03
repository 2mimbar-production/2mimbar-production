import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Karya } from "@/lib/produksi";
import SiteHeader from "@/components/portofolio/SiteHeader";
import SiteFooter from "@/components/portofolio/SiteFooter";
import KaryaCard from "@/components/portofolio/KaryaCard";
import KaryaGallery from "@/components/portofolio/KaryaGallery";

export const revalidate = 60;

export default async function PortofolioPage() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("karya")
    .select("*")
    .eq("terbit", true)
    .order("urutan", { ascending: true })
    .order("tahun", { ascending: false, nullsFirst: false });
  if (error) console.error("Gagal memuat karya:", error.message);

  const karya = (data ?? []) as Karya[];
  const unggulan = karya.filter((k) => k.unggulan).slice(0, 2);
  const kategori = new Set(karya.map((k) => k.kategori)).size;

  return (
    <>
      <section className="relative flex h-[92svh] min-h-[600px] flex-col overflow-hidden bg-brand-900 text-white">
        <SiteHeader overlay />
        {/* Background div, bukan <img>: Safari iPad tidak selalu meregangkan
            <img> absolute setinggi section, jadi gambarnya terpotong. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/hero-duamimbar.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/50 to-brand-900/30" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-10 sm:px-10 sm:pb-14">
          <p className="font-mono text-meta uppercase text-white/70">Duamimbar  /  Divisi Produksi</p>
          <h1 className="font-display mt-5 max-w-5xl text-[3.25rem] leading-[0.92] sm:text-[5.5rem] lg:text-[6.75rem]">
            Karya media Duamimbar, dari naskah sampai tayang.
          </h1>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/20 pt-6">
            {karya.length > 0 ? (
              <dl className="flex gap-10">
                <div>
                  <dt className="font-mono text-meta uppercase text-white/60">Karya</dt>
                  <dd className="font-display mt-1 text-4xl leading-none">{karya.length}</dd>
                </div>
                <div>
                  <dt className="font-mono text-meta uppercase text-white/60">Kategori</dt>
                  <dd className="font-display mt-1 text-4xl leading-none">{kategori}</dd>
                </div>
              </dl>
            ) : (
              <span />
            )}
            <Link
              href="#karya"
              className="inline-flex h-11 items-center gap-2 rounded bg-white px-5 font-medium text-brand-900 transition-colors hover:bg-brand-50"
            >
              Lihat karya <ArrowDown size={16} />
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 sm:px-10">
        {unggulan.length > 0 && (
          <section className="pt-20 sm:pt-28">
            <JudulBagian kicker="Pilihan" judul="Karya unggulan" />
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
              {unggulan.map((k) => (
                <KaryaCard key={k.id} karya={k} besar />
              ))}
            </div>
          </section>
        )}

        <section id="karya" className="scroll-mt-8 pt-20 sm:pt-28">
          <JudulBagian kicker="Arsip" judul="Semua karya" />
          {karya.length ? (
            <KaryaGallery karya={karya} />
          ) : (
            <p className="rounded-md border border-dashed border-line-strong py-16 text-center text-sm text-ink-3">
              Portofolio sedang disiapkan.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function JudulBagian({ kicker, judul }: { kicker: string; judul: string }) {
  return (
    <div className="mb-10">
      <p className="label-meta">{kicker}</p>
      <h2 className="font-display mt-2 text-[2.5rem] leading-none text-ink sm:text-5xl">{judul}</h2>
    </div>
  );
}
