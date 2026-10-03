import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudioAccess } from "@/lib/supabase/server";
import StudioNav from "@/components/studio/StudioNav";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Studio | Duamimbar Produksi",
  robots: { index: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, isAnggota } = await getStudioAccess();
  if (!user) redirect("/login");

  if (!isAnggota) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-md border border-line bg-white p-6">
          <p className="label-meta">Akses Studio</p>
          <h1 className="font-display mt-2 text-3xl text-ink">Akun belum terdaftar</h1>
          <p className="mt-3 text-sm text-ink-2">
            {user.email} belum ada di daftar anggota studio. Tambahkan lewat tabel{" "}
            <code className="font-mono">anggota_studio</code> di Supabase.
          </p>
          <div className="mt-6">
            <LogoutButton variant="menu" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      <StudioNav email={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 md:pb-12 md:pt-10 print:p-0">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
