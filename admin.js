import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cfg = window.LUKAS_CONFIG || {};
const notice = document.querySelector('#notice');
const login = document.querySelector('#loginForm');
const dashboard = document.querySelector('#dashboard');
if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  notice.textContent = 'Website belum terhubung ke Supabase. Ikuti README untuk mengaktifkan admin.';
  login.hidden = true;
} else {
  const db = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  async function showSession() {
    const { data: { user } } = await db.auth.getUser();
    let admin = false;
    if (user) { const { data } = await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle(); admin = !!data; }
    login.hidden = admin; dashboard.hidden = !admin;
    if (user && !admin) notice.textContent = 'Akun ini tidak punya akses admin.';
    if (admin) listPosts();
  }
  login.addEventListener('submit', async e => {
    e.preventDefault(); notice.textContent = 'Memeriksa akun...';
    const { error } = await db.auth.signInWithPassword({ email: document.querySelector('#email').value, password: document.querySelector('#password').value });
    notice.textContent = error ? 'Login gagal. Periksa email dan password.' : '';
    await showSession();
  });
  document.querySelector('#logout').addEventListener('click', async () => { await db.auth.signOut(); dashboard.hidden = true; login.hidden = false; notice.textContent = 'Berhasil keluar.'; });
  async function listPosts() {
    const { data, error } = await db.from('posts').select('id,caption,media_path,created_at').order('created_at', { ascending: false }).limit(50);
    const target = document.querySelector('#adminPosts'); target.replaceChildren();
    if (error) { notice.textContent = 'Gagal memuat daftar postingan.'; return; }
    for (const post of data) {
      const row = document.createElement('div'); row.className = 'admin-row';
      const label = document.createElement('span'); label.textContent = `${new Date(post.created_at).toLocaleDateString('id-ID')} · ${post.caption?.slice(0,100) || 'Media'}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Hapus';
      remove.addEventListener('click', async () => {
        if (!confirm('Hapus postingan ini?')) return;
        const { error } = await db.from('posts').delete().eq('id', post.id);
        if (error) { notice.textContent = 'Gagal menghapus postingan.'; return; }
        if (post.media_path) await db.storage.from('moments').remove([post.media_path]);
        notice.textContent = 'Postingan dihapus.'; listPosts();
      });
      row.append(label,remove); target.append(row);
    }
  }
  document.querySelector('#postForm').addEventListener('submit', async e => {
    e.preventDefault();
    const button = document.querySelector('#publish'); button.disabled = true; notice.textContent = 'Mengunggah...';
    const file = document.querySelector('#media').files[0]; const caption = document.querySelector('#caption').value.trim();
    let path = null;
    try {
      if (!caption && !file) throw Error('Isi cerita atau pilih foto/video.');
      if (file) {
        if (file.size > 50 * 1024 * 1024) throw Error('Ukuran file maksimal 50 MB.');
        if (!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'].includes(file.type)) throw Error('Format file tidak didukung.');
        const { data: { user } } = await db.auth.getUser();
        path = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
        const { error } = await db.storage.from('moments').upload(path, file, { contentType: file.type });
        if (error) throw error;
      }
      const url = path ? db.storage.from('moments').getPublicUrl(path).data.publicUrl : null;
      const { error } = await db.from('posts').insert({ caption, media_path: path, media_url: url, media_type: file ? (file.type.startsWith('image/') ? 'image' : 'video') : null });
      if (error) { if (path) await db.storage.from('moments').remove([path]); throw error; }
      e.target.reset(); notice.textContent = 'Momen berhasil diterbitkan.'; await listPosts();
    } catch (error) { notice.textContent = error.message || 'Gagal menerbitkan momen.'; }
    finally { button.disabled = false; }
  });
  db.auth.onAuthStateChange(() => setTimeout(showSession, 0));
  showSession();
}
