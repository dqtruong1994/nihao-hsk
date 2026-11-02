/**
 * Cloudflare Pages Function: POST /api/auth/register
 * Đăng ký tài khoản học viên mới (Ghi nhận thông tin Họ tên, Email nhân viên)
 */

async function sha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, password, name, email, fullName, otpCode } = await request.json();

    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanName = String(name || fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otpCode || '').trim();

    if (!cleanUser || cleanUser.length < 3) {
      return new Response(JSON.stringify({ error: 'Tên đăng nhập tối thiểu 3 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Địa chỉ email nhân viên không hợp lệ.' }), {
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

      const existingEmail = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
      if (existingEmail) {
        return new Response(JSON.stringify({ error: 'Email này đã được sử dụng bởi một tài khoản khác.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Nếu có truyền mã OTP thì kiểm tra đối chiếu trong DB (khi có cấu hình email)
      if (cleanOtp) {
        try {
          const otpRecord = await env.DB.prepare('SELECT code, expires_at FROM email_verifications WHERE email = ?').bind(cleanEmail).first();
          if (otpRecord) {
            if (Date.now() > otpRecord.expires_at) {
              return new Response(JSON.stringify({ error: 'Mã xác nhận đã hết hạn (quá 10 phút). Vui lòng gửi lại mã mới.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            if (otpRecord.code !== cleanOtp) {
              return new Response(JSON.stringify({ error: 'Mã xác nhận 6 số từ email không chính xác.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            // Xóa mã đã dùng
            await env.DB.prepare('DELETE FROM email_verifications WHERE email = ?').bind(cleanEmail).run();
          }
        } catch (otpErr) {
          console.warn('Verify OTP record warning:', otpErr.message);
        }
      }

      const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const hash = await sha256(password);
      const displayName = cleanName || cleanUser;

      await env.DB.prepare(
        'INSERT INTO users (id, username, email, email_verified, password_hash, name, role, status, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, cleanUser, cleanEmail, 1, hash, displayName, 'student', 'active', Date.now(), Date.now()).run();

      return new Response(JSON.stringify({
        success: true,
        user: { id, username: cleanUser, email: cleanEmail, emailVerified: true, name: displayName, fullName: displayName, role: 'student' }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback nếu chạy không D1
    return new Response(JSON.stringify({
      success: true,
      user: { id: 'u_' + Date.now(), username: cleanUser, email: cleanEmail, emailVerified: true, name: cleanName || cleanUser, fullName: cleanName || cleanUser, role: 'student' }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi đăng ký: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
