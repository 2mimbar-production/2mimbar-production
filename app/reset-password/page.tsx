"use client";

import AuthShell from "@/components/AuthShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  // "checking" -> lagi nunggu Supabase proses link dari email
  // "ready"    -> link valid, boleh isi password baru
  // "invalid"  -> link nggak valid/kadaluarsa
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase otomatis proses token dari URL pas halaman ini dibuka lewat
    // link email, lalu kirim event PASSWORD_RECOVERY. Kalau event itu nggak
    // pernah muncul dalam beberapa detik, berarti link-nya nggak valid.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    // Jaga-jaga kalau event-nya udah keburu lewat sebelum listener terpasang.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus((s) => (s === "checking" ? "ready" : s));
    });

    const timeout = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message ?? "Gagal mengubah password. Coba lagi.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <AuthShell judul="Password baru" sub="Bikin password baru buat akunmu.">

        {status === "checking" && (
          <p className="text-sm text-ink-3">Memeriksa link...</p>
        )}

        {status === "invalid" && (
          <div className="rounded border-l-2 border-signal bg-signal/5 px-3 py-2.5">
            <p className="text-sm text-signal">
              Link ini nggak valid atau udah kadaluarsa. Minta link baru lewat halaman{" "}
              <Link href="/forgot-password" className="underline">
                Lupa Password
              </Link>
              .
            </p>
          </div>
        )}

        {status === "ready" && !success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-meta mb-1.5 block">Password baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div>
              <label className="label-meta mb-1.5 block">Konfirmasi password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ulangi password baru"
              />
            </div>

            {error && <p className="text-sm text-signal">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:bg-brand-300"
            >
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

        {success && (
          <div className="rounded border-l-2 border-brand bg-brand-50 px-3 py-2.5">
            <p className="text-sm text-brand">
              Password berhasil diubah. Mengarahkan ke halaman login...
            </p>
          </div>
        )}
    </AuthShell>
  );
}
