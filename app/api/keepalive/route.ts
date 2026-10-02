import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Dipanggil Vercel Cron sekali sehari (lihat vercel.json). Supabase Free
// mem-pause project yang sepi query selama 7 hari; satu query kecil per hari
// cukup untuk mencegahnya, termasuk saat Studio jarang dibuka.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  const { error } = await supabase.from("karya").select("id", { head: true, count: "exact" }).eq("terbit", true);
  return NextResponse.json({ ok: !error, waktu: new Date().toISOString() }, { status: error ? 500 : 200 });
}
