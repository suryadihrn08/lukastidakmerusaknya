import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cfg = window.LUKAS_CONFIG || {};
const container = document.querySelector('#livePosts');
if (cfg.contactEmail) {
  const a = document.querySelector('#contactEmail');
  a.href = `mailto:${cfg.contactEmail}`;
  a.textContent = cfg.contactEmail;
} else document.querySelector('#kontak').querySelector('p:last-child').textContent = 'Kontak segera tersedia.';
if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
  const db = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  async function refresh() {
    const { data, error } = await db.from('posts').select('id,caption,media_url,media_type,created_at').order('created_at', { ascending: false }).limit(50);
    if (error) { container.textContent = 'Postingan terbaru belum bisa dimuat. Coba refresh halaman.'; return; }
    container.replaceChildren();
    for (const post of data) {
      const card = document.createElement('article'); card.className = 'post-card';
      const head = document.createElement('div'); head.className = 'post-header';
      const avatar = document.createElement('img'); avatar.className = 'post-avatar'; avatar.src = 'assets/logo.jpeg'; avatar.alt = '';
      const by = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = 'Lukas';
      const date = document.createElement('time'); date.dateTime = post.created_at; date.textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(post.created_at));
      by.append(name,date); head.append(avatar,by); card.append(head);
      if (post.caption) { const p = document.createElement('p'); p.className = 'post-caption'; p.textContent = post.caption; card.append(p); }
      if (post.media_url && post.media_type === 'image') { const img = document.createElement('img'); img.className = 'post-media'; img.src = post.media_url; img.alt = post.caption || 'Foto momen Lukas'; img.loading = 'lazy'; card.append(img); }
      if (post.media_url && post.media_type === 'video') { const video = document.createElement('video'); video.src = post.media_url; video.controls = true; video.playsInline = true; video.preload = 'metadata'; card.append(video); }
      container.append(card);
    }
  }
  refresh();
  db.channel('lukas-posts').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, refresh).subscribe();
}
