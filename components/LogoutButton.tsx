"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({
  variant = "icon",
}: {
  variant?: "icon" | "menu";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "menu") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded border border-line-strong bg-white px-4 py-2.5 text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} strokeWidth={1.75} />}
        <span className="text-sm font-medium">Keluar</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Keluar"
      className="flex items-center justify-center rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} strokeWidth={1.75} className="animate-spin" /> : <LogOut size={18} strokeWidth={1.75} />}
    </button>
  );
}
