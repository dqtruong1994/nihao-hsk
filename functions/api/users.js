/**
 * Cloudflare Pages Function: /api/users
 * Quản lý danh sách thành viên và phân quyền (RBAC)
 */

export async function onRequestGet({ env }) {
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        'SELECT id, username, name, role, status, created_at, last_login FROM users ORDER BY created_at DESC'
      ).all();
      return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify([
      { id: 'admin_01', username: 'admin', name: 'Quản trị viên', role: 'admin', status: 'active', created_at: Date.now() }
    ]), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPut({ request, env }) {
  try {
    const body = await request.json();
    const { id, role, status, name } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Thiếu User ID.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (env.DB) {
      if (role) await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run();
      if (status) await env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run();
      if (name) await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Thiếu User ID.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (env.DB) {
      // Bảo vệ tài khoản admin gốc
      await env.DB.prepare('DELETE FROM users WHERE id = ? AND username != "admin"').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

