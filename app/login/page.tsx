"use client";

import AuthShell from "@/components/AuthShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/studio");
    router.refresh();
  }

  return (
    <AuthShell judul="Masuk Studio" sub="Khusus anggota Divisi Produksi Duamimbar.">

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
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label-meta block">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand underline">
                Lupa password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-signal">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:bg-brand-300"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs text-ink-3 mt-6">
          <Link href="/" className="text-brand underline">
            Kembali ke portofolio
          </Link>
        </p>
    </AuthShell>
  );
}
