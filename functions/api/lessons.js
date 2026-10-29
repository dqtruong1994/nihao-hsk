/**
 * Cloudflare Pages Function: /api/lessons
 * CRUD Dữ liệu bài học HSK 1, 2, 3
 */

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const course = url.searchParams.get('course');
    const index = url.searchParams.get('index');

    if (env.DB) {
      if (course && index !== null) {
        const row = await env.DB.prepare(
          'SELECT * FROM lessons WHERE course = ? AND lesson_index = ?'
        ).bind(course, Number(index)).first();

        if (row) {
          return new Response(row.data_json, { headers: { 'Content-Type': 'application/json' } });
        }
      } else {
        const { results } = await env.DB.prepare(
          'SELECT id, course, lesson_index, title_vi, title_zh, updated_at FROM lessons ORDER BY course ASC, lesson_index ASC'
        ).all();
        return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { course, index, data } = body;

    if (!course || index === undefined || !data) {
      return new Response(JSON.stringify({ error: 'Dữ liệu bài học không đầy đủ.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const id = `${course}_${index}`;
    const titleVi = data.title || data.titleVi || `Bài ${Number(index) + 1}`;
    const titleZh = data.titleZh || data.chinese || '';
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO lessons (id, course, lesson_index, title_vi, title_zh, data_json, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
           title_vi = ?4, title_zh = ?5, data_json = ?6, updated_at = ?7`
      ).bind(id, course, Number(index), titleVi, titleZh, jsonStr, Date.now()).run();
    }

    return new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const course = url.searchParams.get('course');
    const index = url.searchParams.get('index');

    if (env.DB && course && index !== null) {
      await env.DB.prepare('DELETE FROM lessons WHERE course = ? AND lesson_index = ?').bind(course, Number(index)).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

