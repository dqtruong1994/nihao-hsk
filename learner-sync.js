(() => {
  'use strict';
  try { if (window.parent !== window && window.parent.HSKSync) { window.HSKSync = window.parent.HSKSync; return; } } catch {}
  const subscribers = new Set(), snapshots = new Map(), sent = new Map();
  const queueKey = 'hskPendingAttempts_v1';
  const keys = {
    hsk1: { done: 'hsk12done', score: 'hsk12score', xp: 'hskXP', lesson: 'hsk1Lesson' },
    hsk2: { done: 'hsk2done', score: 'hsk2score', xp: 'hsk2XP', lesson: 'hsk2Lesson' },
    hsk3: { done: 'hsk3done', score: 'hsk3score', xp: 'hsk3XP', lesson: 'hsk3Lesson' },
  };
  const memory = new Map();
  const read = key => { try { return localStorage.getItem(key) ?? memory.get(key) ?? null; } catch { return memory.get(key) ?? null; } };
  const write = (key, value) => { memory.set(key, String(value)); try { localStorage.setItem(key, String(value)); } catch {} };
  const readJSON = (key, fallback) => { try { return JSON.parse(read(key) || 'null') ?? fallback; } catch { return fallback; } };
  const pendingAttempts = () => { const items = readJSON(queueKey, []); return Array.isArray(items) ? items : []; };
  let student = null, sessionPromise = null, flushing = false, timer = null, failures = 0;
  let state = { state: 'connecting', message: 'Đang kết nối lớp học…', student: null, profileVersion: 0 };

  function emit(kind, message) {
    state = { ...state, state: kind, message, student };
    document.querySelectorAll('[data-sync-status]').forEach(node => { node.textContent = message; node.dataset.state = kind; });
    subscribers.forEach(fn => { try { fn(state); } catch {} });
  }
  async function request(path, method = 'GET', data) {
    const response = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) { const error = new Error(result?.error || 'Chưa kết nối được với lớp học.'); error.status = response.status; throw error; }
    return result;
  }
  function applyProfile(profile) {
    student = profile;
    write('hskStudentName', profile.name);
    write('hskLearnerCode', profile.code);
    for (const course of Object.keys(keys)) {
      const k = keys[course], remote = profile[course]; if (!remote) continue;
      const raw = readJSON(k.done, []), localDone = Array.isArray(raw) ? raw : [];
      const completed = [...new Set([...localDone, ...remote.completedLessons])].filter(x => Number.isInteger(x) && x >= 0 && x < 12).sort((a, b) => a - b);
      write(k.done, JSON.stringify(completed));
      write(k.xp, String(Math.max(Number(read(k.xp)) || 0, remote.xp || 0)));
      if (remote.lastScore !== null && !pendingAttempts().some(x => x.course === course)) write(k.score, remote.lastScore + '%');
      if (read(k.lesson) === null) write(k.lesson, String(remote.activeLesson || 0));
    }
    state = { ...state, profileVersion: state.profileVersion + 1 };
    emit('connected', 'Đã kết nối lớp học · ' + profile.code);
  }
  async function ensureSession() {
    if (student) return student;
    if (!sessionPromise) {
      const enroll = async () => {
        let result = await request('/api/learner/session');
        if (!result.registered) {
          const name = (read('hskStudentName') || '').trim();
          if (!name) { emit('idle', 'Nhập tên trong bài học để lưu tiến độ với lớp.'); return null; }
          result = await request('/api/learner/session', 'POST', { name });
        }
        applyProfile(result.student); return student;
      };
      sessionPromise = (navigator.locks ? navigator.locks.request('hsk-learner-enrollment', enroll) : enroll()).finally(() => { sessionPromise = null; });
    }
    return sessionPromise;
  }
  function localSnapshot(course) {
    const k = keys[course], raw = readJSON(k.done, []), score = read(k.score);
    return { course, completedLessons: Array.isArray(raw) ? raw.filter(x => Number.isInteger(x) && x >= 0 && x < 12) : [], activeLesson: Math.max(0, Math.min(11, parseInt(read(k.lesson), 10) || 0)), xp: Math.max(0, Math.min(1000000, Number(read(k.xp)) || 0)), lastScore: /^\d+%$/.test(score || '') ? Math.min(100, parseInt(score, 10)) : null };
  }
  function schedule(delay = 450) { clearTimeout(timer); timer = setTimeout(flush, delay); }
  function snapshot(data) {
    if (!keys[data.course]) return;
    const value = { course: data.course, completedLessons: [...new Set(data.completedLessons || [])].filter(x => Number.isInteger(x) && x >= 0 && x < 12), activeLesson: Math.max(0, Math.min(11, Number(data.activeLesson) || 0)), xp: Math.max(0, Math.min(1000000, Math.floor(Number(data.xp) || 0))), lastScore: Number.isFinite(data.lastScore) ? data.lastScore : null };
    if (sent.get(data.course) === JSON.stringify(value)) return;
    snapshots.set(data.course, value); schedule();
  }
  async function flush() {
    if (flushing) return;
    if (!navigator.onLine) { emit('offline', 'Đang lưu trên máy · sẽ đồng bộ khi có mạng.'); return; }
    flushing = true; let failed = false;
    try {
      if (!await ensureSession()) return;
      emit('syncing', 'Đang đồng bộ tiến độ với lớp học…');
      for (const attempt of pendingAttempts()) {
        await request('/api/learner/attempts', 'POST', attempt);
        write(queueKey, JSON.stringify(pendingAttempts().filter(x => x.eventId !== attempt.eventId)));
      }
      for (const [course, value] of [...snapshots]) {
        const current = localSnapshot(course);
        value.completedLessons = [...new Set([...value.completedLessons, ...current.completedLessons])].sort((a, b) => a - b);
        value.xp = Math.max(value.xp, current.xp);
        await request('/api/learner/progress', 'PUT', value);
        sent.set(course, JSON.stringify(value));
        if (snapshots.get(course) === value) snapshots.delete(course);
      }
      failures = 0; emit('synced', 'Đã đồng bộ với lớp học · ' + student.code);
    } catch (error) {
      failed = true; failures++;
      if (error.status === 401) student = null;
      emit('offline', 'Tiến độ vẫn được lưu trên máy. Đang chờ đồng bộ.');
      schedule(Math.min(60000, 5000 * failures));
    } finally {
      flushing = false;
      if (!failed && student && (snapshots.size || pendingAttempts().length)) schedule();
    }
  }
  async function setName(name) {
    write('hskStudentName', name);
    try {
      await ensureSession();
      if (!student || student.name !== name) applyProfile((await request('/api/learner/session', 'POST', { name })).student);
      for (const course of Object.keys(keys)) snapshot(localSnapshot(course));
    } catch { emit('offline', 'Tên và tiến độ đã lưu trên máy. Đang chờ đồng bộ.'); schedule(5000); }
  }
  function attempt(data) {
    if (!keys[data.course] || !data.eventId) return;
    const queue = pendingAttempts();
    if (!queue.some(x => x.eventId === data.eventId)) { queue.push(data); write(queueKey, JSON.stringify(queue)); }
    schedule(100);
  }
  window.HSKSync = {
    snapshot, attempt, setName,
    subscribe(fn) { subscribers.add(fn); fn(state); return () => subscribers.delete(fn); },
    async refresh() { student = null; await ensureSession(); },
  };
  addEventListener('online', () => { for (const course of Object.keys(keys)) snapshot(localSnapshot(course)); schedule(100); });
  addEventListener('storage', event => { if (event.key === queueKey) schedule(250); });
  addEventListener('DOMContentLoaded', async () => {
    try {
      if (await ensureSession()) { for (const course of Object.keys(keys)) snapshot(localSnapshot(course)); }
    } catch { emit('offline', 'Tiến độ vẫn được lưu trên máy. Đang chờ đồng bộ.'); schedule(5000); }
  });
})();
