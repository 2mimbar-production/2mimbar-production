-- Batas di sisi server untuk bucket gambar: hanya file gambar, maksimal 5 MB.
-- Aplikasi sudah mengecilkan gambar sebelum diunggah (lib/gambar.ts), jadi
-- batas ini hanya pengaman kalau ada unggahan dari luar aplikasi.
update storage.buckets
set file_size_limit = 5 * 1024 * 1024,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id in ('portofolio', 'bukti-tayang');
