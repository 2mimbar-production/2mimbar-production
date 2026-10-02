import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Kecilkan gambar di browser sebelum diunggah: sisi terpanjang maksimal
 * `maksSisi` px, disimpan sebagai JPEG. Screenshot HP 2-4 MB biasanya jadi
 * 150-400 KB, jadi kuota storage (1 GB) dan egress Supabase jauh lebih awet.
 * Kalau browser gagal memproses, file asli dipakai apa adanya.
 */
export async function kompresGambar(file: File, maksSisi = 1600, kualitas = 0.8): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * skala);
    canvas.height = Math.round(bitmap.height * skala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Latar putih supaya PNG transparan tidak jadi hitam di JPEG.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", kualitas));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Kompres lalu unggah ke bucket publik. Mengembalikan URL publik. */
export async function unggahGambar(supabase: SupabaseClient, bucket: string, folder: string, file: File) {
  const blob = await kompresGambar(file);
  const ext = blob.type === "image/jpeg" ? "jpg" : file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: "31536000",
  });
  if (error) return { url: null, error: error.message };
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl, error: null };
}

/** Hapus file storage dari URL publiknya. Gagal pun diabaikan (tidak memblokir form). */
export async function hapusGambar(supabase: SupabaseClient, url: string | null | undefined) {
  const m = url?.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return;
  await supabase.storage.from(m[1]).remove([decodeURIComponent(m[2])]);
}
