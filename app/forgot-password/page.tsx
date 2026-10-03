"use client";

import AuthShell from "@/components/AuthShell";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      // Sengaja selalu tampilkan pesan sukses yang sama, walau email gagal
      // dikirim (mis. akun nggak ada) — biar orang luar nggak bisa nebak
      // email mana yang terdaftar di sistem cuma dari respons form ini.
      if (error) console.error("resetPasswordForEmail error:", error.message);
      setSent(true);
    } catch (err) {
      setError("Tidak bisa terhubung ke server. Cek koneksi internet, lalu coba lagi.");
    }

    setLoading(false);
  }

  return (
    <AuthShell judul="Lupa password" sub="Masukkan email akunmu, kami kirim link buat bikin password baru.">

        {sent ? (
          <div className="rounded border-l-2 border-brand bg-brand-50 px-3 py-2.5">
            <p className="text-sm text-brand">
              Kalau email <span className="font-medium">{email}</span> terdaftar, link reset
              password udah dikirim. Cek inbox (atau folder spam) kamu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-meta mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="nama@perusahaan.com"
              />
            </div>

            {error && <p className="text-sm text-signal">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:bg-brand-300"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        )}

        <p className="text-xs text-ink-3 mt-6">
          <Link href="/login" className="text-brand underline">
            Kembali ke halaman login
          </Link>
        </p>
    </AuthShell>
  );
}
