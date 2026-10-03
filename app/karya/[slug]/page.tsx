import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { type Karya, embedUrl, thumbnailDari } from "@/lib/produksi";
import SiteHeader from "@/components/portofolio/SiteHeader";
import SiteFooter from "@/components/portofolio/SiteFooter";
import KaryaCard from "@/components/portofolio/KaryaCard";

export const revalidate = 60;

async function ambilKarya(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("karya").select("*").eq("slug", slug).eq("terbit", true).maybeSingle();
  return data as Karya | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const karya = await ambilKarya(params.slug);
  if (!karya) return {};
  const gambar = thumbnailDari(karya);
  return {
    title: `${karya.judul} | Duamimbar Produksi`,
    description: karya.ringkasan ?? undefined,
    openGraph: gambar ? { images: [gambar] } : undefined,
  };
}

export default async function KaryaDetailPage({ params }: { params: { slug: string } }) {
  const karya = await ambilKarya(params.slug);
  if (!karya) notFound();

  const supabase = createPublicClient();
  const { data: lain } = await supabase
    .from("karya")
    .select("*")
    .eq("terbit", true)
    .neq("id", karya.id)
    .order("urutan")
    .limit(3);

  const embed = embedUrl(karya.video_url);
  const gambar = thumbnailDari(karya);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="pb-10 pt-10 sm:pt-14">
          <Link href="/#karya" className="label-meta inline-flex items-center gap-1.5 hover:text-ink">
            <ArrowLeft size={13} /> Semua karya
          </Link>
          <p className="label-meta mt-10">{[karya.kategori, karya.tahun].filter(Boolean).join("  /  ")}</p>
          <h1 className="font-display mt-3 max-w-5xl text-[2.75rem] leading-[0.95] text-ink sm:text-[4.5rem]">{karya.judul}</h1>
          {karya.ringkasan && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{karya.ringkasan}</p>}
        </div>

        {(embed || gambar) && (
          <div className="overflow-hidden rounded-sm bg-brand-900">
            {embed ? (
              <div className="aspect-video">
                <iframe
                  src={embed}
                  title={karya.judul}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img src={gambar!} alt={karya.judul} className="w-full" />
            )}
          </div>
        )}

        <div className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-[14rem_1fr] md:gap-16">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-1 md:content-start">
            <div>
              <dt className="label-meta">Klien</dt>
              <dd className="mt-1 text-ink">{karya.klien ?? "Produksi internal"}</dd>
            </div>
            {karya.tahun && (
              <div>
                <dt className="label-meta">Tahun</dt>
                <dd className="mt-1 font-mono text-ink">{karya.tahun}</dd>
              </div>
            )}
            <div>
              <dt className="label-meta">Kategori</dt>
              <dd className="mt-1 text-ink">{karya.kategori}</dd>
            </div>
            {karya.link_url && (
              <div>
                <dt className="label-meta">Tautan</dt>
                <dd className="mt-1">
                  <a
                    href={karya.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-800"
                  >
                    Lihat di sumber <ArrowUpRight size={15} />
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {karya.deskripsi ? (
            <div className="max-w-2xl whitespace-pre-line text-[1.0625rem] leading-relaxed text-ink-2">{karya.deskripsi}</div>
          ) : (
            <div />
          )}
        </div>

        {lain && lain.length > 0 && (
          <section className="mt-24 border-t border-line pt-12">
            <p className="label-meta">Lanjut menonton</p>
            <h2 className="font-display mb-10 mt-2 text-4xl text-ink">Karya lain</h2>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-3">
              {(lain as Karya[]).map((k) => (
                <KaryaCard key={k.id} karya={k} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
