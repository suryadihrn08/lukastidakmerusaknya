# Website Lukas Tidak Merusaknya

Website GitHub Pages dengan postingan realtime melalui Supabase.

## Mengaktifkan admin

1. Buat proyek Supabase. Di SQL Editor jalankan isi `supabase.sql` sekali.
2. Di Authentication → Users → Add user, buat akun dengan email dan password pribadi. Pastikan email dikonfirmasi.
3. Salin User UID akun tadi. Jalankan di SQL Editor: `insert into public.admins (user_id) values ('USER_UID_DI_SINI') on conflict (user_id) do nothing;`
4. Di Project Settings → API, salin Project URL dan anon/publishable key ke `config.js`. Isi `contactEmail` dengan alamatmu. Jangan memasukkan service_role/secret key atau password ke repo.
5. Upload seluruh isi folder ini ke akar repo `lukastidakmerusaknya`. Aktifkan GitHub Pages dari branch utama/root jika belum aktif.
6. Login lewat `https://suryadihrn08.github.io/lukastidakmerusaknya/admin.html` memakai akun langkah 2. Alamat admin tidak muncul di menu; pembatasan akses tetap ditegakkan Supabase.

Admin dapat memposting tulisan, foto, atau video maksimal 50 MB serta menghapus postingan. Posting baru diperbarui otomatis pada pengunjung yang sedang membuka halaman. Arsip foto dan video lama tetap ditampilkan. Tanpa konfigurasi Supabase, arsip dapat dibuka tetapi login dan posting realtime belum aktif.

Jika tetap memakai nama repo lama, alamat admin mengikuti URL lama. Agar URL berubah menjadi `/lukastidakmerusaknya/`, ganti nama repository di GitHub Settings → General → Repository name, lalu cek pengaturan Pages.
