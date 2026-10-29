/**
 * Cloudflare Pages Function: POST /api/auth/register
 * Đăng ký tài khoản học viên mới
 */

async function sha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, password, name } = await request.json();

    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanUser || cleanUser.length < 3) {
      return new Response(JSON.stringify({ error: 'Tên đăng nhập tối thiểu 3 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Mật khẩu tối thiểu 6 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(cleanUser).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'Tên đăng nhập đã được sử dụng.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const hash = await sha256(password);
      const displayName = cleanName || cleanUser;

      await env.DB.prepare(
        'INSERT INTO users (id, username, password_hash, name, role, status, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, cleanUser, hash, displayName, 'student', 'active', Date.now(), Date.now()).run();

      return new Response(JSON.stringify({
        success: true,
        user: { id, username: cleanUser, name: displayName, role: 'student' }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback nếu chạy không D1
    return new Response(JSON.stringify({
      success: true,
      user: { id: 'u_' + Date.now(), username: cleanUser, name: cleanName || cleanUser, role: 'student' }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi đăng ký: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

