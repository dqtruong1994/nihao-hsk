/**
 * Cloudflare Worker / Pages Entrypoint
 * Tương thích cả Cloudflare Workers (Static Assets) và Cloudflare Pages
 */

import * as authLogin from './functions/api/auth/login.js';
import * as authRegister from './functions/api/auth/register.js';
import * as lessonsApi from './functions/api/lessons.js';
import * as menusApi from './functions/api/menus.js';
import * as usersApi from './functions/api/users.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API Đăng nhập
    if (url.pathname === '/api/auth/login') {
      if (request.method === 'POST') return authLogin.onRequestPost({ request, env, ctx });
    }

    // 2. API Đăng ký
    if (url.pathname === '/api/auth/register') {
      if (request.method === 'POST') return authRegister.onRequestPost({ request, env, ctx });
    }

    // 3. API Quản lý Bài học
    if (url.pathname.startsWith('/api/lessons')) {
      if (request.method === 'GET' && lessonsApi.onRequestGet) return lessonsApi.onRequestGet({ request, env, ctx });
      if (request.method === 'POST' && lessonsApi.onRequestPost) return lessonsApi.onRequestPost({ request, env, ctx });
      if (request.method === 'DELETE' && lessonsApi.onRequestDelete) return lessonsApi.onRequestDelete({ request, env, ctx });
    }

    // 4. API Quản lý Menu
    if (url.pathname.startsWith('/api/menus')) {
      if (request.method === 'GET' && menusApi.onRequestGet) return menusApi.onRequestGet({ request, env, ctx });
      if (request.method === 'POST' && menusApi.onRequestPost) return menusApi.onRequestPost({ request, env, ctx });
      if (request.method === 'DELETE' && menusApi.onRequestDelete) return menusApi.onRequestDelete({ request, env, ctx });
    }

    // 5. API Quản lý Người dùng & Phân quyền
    if (url.pathname.startsWith('/api/users')) {
      if (request.method === 'GET' && usersApi.onRequestGet) return usersApi.onRequestGet({ request, env, ctx });
      if (request.method === 'PUT' && usersApi.onRequestPut) return usersApi.onRequestPut({ request, env, ctx });
      if (request.method === 'DELETE' && usersApi.onRequestDelete) return usersApi.onRequestDelete({ request, env, ctx });
    }

    // 6. Phục vụ file tĩnh (HTML, CSS, JS, âm thanh, icon) qua Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

