/**
 * Cloudflare Pages Function: /api/menus
 * GET: Lấy danh sách menu điều hướng
 * POST: Thêm hoặc sửa menu (Dành cho Admin)
 * DELETE: Xóa menu (Dành cho Admin)
 */

export async function onRequestGet({ env }) {
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        'SELECT id, label, route, url, sort_order as "order", visible, is_system as isSystem FROM menus ORDER BY sort_order ASC'
      ).all();
      return new Response(JSON.stringify(results || []), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify([
      { id: 'home', label: 'Trang chủ', route: 'home', url: '#home', order: 1, visible: true, isSystem: true },
      { id: 'hsk1', label: 'HSK 1', route: 'hsk1', url: '#hsk1', order: 2, visible: true, isSystem: true },
      { id: 'hsk2', label: 'HSK 2', route: 'hsk2', url: '#hsk2', order: 3, visible: true, isSystem: true },
      { id: 'hsk3', label: 'HSK 3', route: 'hsk3', url: '#hsk3', order: 4, visible: true, isSystem: true },
      { id: 'dict', label: '📖 Tra từ điển', route: 'dict', url: '#dict', order: 5, visible: true, isSystem: false },
      { id: 'notebook', label: '⭐ Sổ tay từ vựng', route: 'notebook', url: '#notebook', order: 6, visible: true, isSystem: false }
    ]), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const item = await request.json();
    if (!item.id || !item.label) {
      return new Response(JSON.stringify({ error: 'Thiếu id hoặc nhãn menu.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO menus (id, label, route, url, sort_order, visible, is_system)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
           label = ?2, route = ?3, url = ?4, sort_order = ?5, visible = ?6`
      ).bind(
        item.id,
        item.label,
        item.route || item.id,
        item.url || '#' + item.id,
        item.order || 99,
        item.visible === false ? 0 : 1,
        item.isSystem ? 1 : 0
      ).run();

      return new Response(JSON.stringify({ success: true, item }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, item }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Thiếu menu ID.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (env.DB) {
      await env.DB.prepare('DELETE FROM menus WHERE id = ? AND is_system = 0').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

