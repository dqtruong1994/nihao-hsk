/**
 * Cloudflare Pages Function: POST /api/auth/login
 * Xác thực tài khoản với Cloudflare D1
 */

async function sha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập tài khoản và mật khẩu.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const hash = await sha256(password);

    // Kiểm tra nếu có D1 Database binding
    if (env.DB) {
      const user = await env.DB.prepare(
        'SELECT id, username, password_hash, name, role, status FROM users WHERE username = ?'
      ).bind(cleanUsername).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Tài khoản không tồn tại.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (user.status === 'blocked') {
        return new Response(JSON.stringify({ error: 'Tài khoản đã bị tạm khóa.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (user.password_hash !== hash) {
        return new Response(JSON.stringify({ error: 'Mật khẩu không chính xác.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Cập nhật last_login
      await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(Date.now(), user.id).run();

      const userProfile = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };

      return new Response(JSON.stringify({ success: true, user: userProfile }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback nếu chưa kết nối D1 (dùng tài khoản admin mặc định)
    if (cleanUsername === 'admin' && password === 'admin@nihao123') {
      return new Response(JSON.stringify({
        success: true,
        user: { id: 'admin_01', username: 'admin', name: 'Quản trị viên', role: 'admin' }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Tài khoản hoặc mật khẩu không chính xác.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

