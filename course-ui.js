(() => {
  const menu = document.getElementById('lessonMenu');
  const aside = menu.closest('aside');
  menu.addEventListener('click', () => {
    const open = aside.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('nav').addEventListener('click', event => {
    const button = event.target.closest('.week');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    aside.classList.remove('nav-open');
    menu.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  addEventListener('storage', event => {
    if (event.key !== 'hskStudentName' || !event.newValue) return;
    document.getElementById('brandName').textContent = event.newValue;
    document.getElementById('studentName').value = event.newValue;
    document.getElementById('welcomeOverlay').classList.add('hidden');
    document.getElementById('learningApp').style.display = 'grid';
  });
  document.getElementById('welcomeForm').addEventListener('submit', () => {
    if (document.getElementById('welcomeOverlay').classList.contains('hidden')) {
      document.getElementById('title').setAttribute('tabindex', '-1');
      document.getElementById('title').focus();
    }
  });
})();

(() => {
  if (!window.HSKSync) return;
  const isHSK2 = /hsk2(?:\.html)?\/?$/.test(location.pathname);
  const stateKeys = isHSK2 ? { done:'hsk2done', xp:'hsk2XP', score:'hsk2score' } : { done:'hsk12done', xp:'hskXP', score:'hsk12score' };
  let appliedVersion = 0;
  window.HSKSync.subscribe(status => {
    document.querySelectorAll('[data-sync-status]').forEach(node => { node.textContent = status.message; node.dataset.state = status.state; });
    if (!status.student || status.profileVersion === appliedVersion) return;
    appliedVersion = status.profileVersion;
    document.getElementById('brandName').textContent = status.student.name;
    document.getElementById('welcomeOverlay').classList.add('hidden');
    document.getElementById('learningApp').style.display = 'grid';
    try {
      const stored = JSON.parse(store.getItem(stateKeys.done) || '[]');
      if (Array.isArray(stored)) done = [...new Set([...done, ...stored])].filter(x => Number.isInteger(x) && x >= 0 && x < 12);
      xp = Math.max(Number(xp) || 0, Number(store.getItem(stateKeys.xp)) || 0);
      last = store.getItem(stateKeys.score) || last;
      refreshNavigation(); stats(); updateDashboard();
    } catch {}
  });
  document.getElementById('welcomeForm').addEventListener('submit', () => {
    if (document.getElementById('welcomeOverlay').classList.contains('hidden')) {
      window.HSKSync.setName(document.getElementById('brandName').textContent);
    }
  });
})();
