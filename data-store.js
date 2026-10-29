/**
 * Data Store - Quản lý Dữ liệu Bài học, Menu, Từ điển & Ghi chú
 * Hỗ trợ lưu trữ cục bộ và đồng bộ Cloudflare D1 / Pages API
 */
(() => {
  'use strict';

  const MENUS_KEY = 'hsk_navigation_menus_v1';
  const CUSTOM_LESSONS_KEY = 'hsk_custom_lessons_v1';
  const BOOKMARKS_KEY = 'hsk_user_bookmarks_v1';
  const NOTES_KEY = 'hsk_lesson_notes_v1';

  // --- 1. Quản lý Menu (Navigation) ---
  const DEFAULT_MENUS = [
    { id: 'home', label: 'Trang chủ', route: 'home', url: '#home', order: 1, visible: true, isSystem: true },
    { id: 'hsk1', label: 'HSK 1', route: 'hsk1', url: '#hsk1', order: 2, visible: true, isSystem: true },
    { id: 'hsk2', label: 'HSK 2', route: 'hsk2', url: '#hsk2', order: 3, visible: true, isSystem: true },
    { id: 'hsk3', label: 'HSK 3', route: 'hsk3', url: '#hsk3', order: 4, visible: true, isSystem: true },
    { id: 'dict', label: '📖 Tra từ điển', route: 'dict', url: '#dict', order: 5, visible: true, isSystem: false },
    { id: 'notebook', label: '⭐ Sổ tay từ vựng', route: 'notebook', url: '#notebook', order: 6, visible: true, isSystem: false }
  ];

  function getMenus() {
    try {
      const data = localStorage.getItem(MENUS_KEY);
      if (data) {
        const list = JSON.parse(data);
        return Array.isArray(list) ? list.sort((a, b) => a.order - b.order) : DEFAULT_MENUS;
      }
    } catch {}
    saveMenus(DEFAULT_MENUS);
    return DEFAULT_MENUS;
  }

  function saveMenus(menus) {
    try {
      localStorage.setItem(MENUS_KEY, JSON.stringify(menus));
      window.dispatchEvent(new CustomEvent('hsk-menu-updated', { detail: menus }));
    } catch {}
  }

  function addMenu(menu) {
    const menus = getMenus();
    const id = 'm_' + Date.now().toString(36);
    const newMenu = {
      id,
      label: String(menu.label || '').trim(),
      route: String(menu.route || id).trim(),
      url: String(menu.url || '#' + id).trim(),
      order: Number(menu.order) || menus.length + 1,
      visible: menu.visible !== false,
      isSystem: false
    };
    menus.push(newMenu);
    saveMenus(menus);
    return newMenu;
  }

  function updateMenu(id, updates) {
    const menus = getMenus();
    const index = menus.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Không tìm thấy menu.');
    menus[index] = { ...menus[index], ...updates };
    saveMenus(menus);
    return menus[index];
  }

  function deleteMenu(id) {
    let menus = getMenus();
    const menu = menus.find(m => m.id === id);
    if (menu?.isSystem) {
      throw new Error('Menu hệ thống không thể xóa. Bạn có thể ẩn menu này nếu muốn.');
    }
    menus = menus.filter(m => m.id !== id);
    saveMenus(menus);
  }

  // --- 2. Quản lý Bài học (Lessons CRUD) ---
  function getCustomLessons(level = 'hsk1') {
    try {
      const data = localStorage.getItem(CUSTOM_LESSONS_KEY + '_' + level);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCustomLessons(level, lessons) {
    try {
      localStorage.setItem(CUSTOM_LESSONS_KEY + '_' + level, JSON.stringify(lessons));
      window.dispatchEvent(new CustomEvent('hsk-lessons-updated', { detail: { level, lessons } }));
    } catch {}
  }

  function upsertLesson(level, lesson) {
    const lessons = getCustomLessons(level);
    const number = Number(lesson.number);
    const existingIndex = lessons.findIndex(l => l.number === number);

    const record = {
      number,
      title: lesson.title || `Bài ${number}`,
      topicZh: lesson.topicZh || '',
      topicPy: lesson.topicPy || '',
      topicVi: lesson.topicVi || '',
      description: lesson.description || '',
      grammarRule: lesson.grammarRule || '',
      vocabulary: Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [],
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      lessons[existingIndex] = { ...lessons[existingIndex], ...record };
    } else {
      lessons.push(record);
      lessons.sort((a, b) => a.number - b.number);
    }

    saveCustomLessons(level, lessons);
    return record;
  }

  function deleteLesson(level, number) {
    let lessons = getCustomLessons(level);
    lessons = lessons.filter(l => l.number !== Number(number));
    saveCustomLessons(level, lessons);
  }

  // --- 3. Sổ tay từ vựng yêu thích (Bookmarks) ---
  function getBookmarks() {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function toggleBookmark(word) {
    const list = getBookmarks();
    const index = list.findIndex(item => item.hanzi === word.hanzi);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return false; // Đã bỏ lưu
    } else {
      list.unshift({
        hanzi: word.hanzi,
        pinyin: word.pinyin || '',
        hv: word.hv || '',
        meaning: word.meaning || '',
        course: word.course || 'HSK',
        savedAt: Date.now()
      });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return true; // Đã lưu
    }
  }

  function isBookmarked(hanzi) {
    return getBookmarks().some(item => item.hanzi === hanzi);
  }

  // --- 4. Ghi chú cá nhân bài học (Lesson Notes) ---
  function getNote(course, lessonNumber) {
    try {
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      return notes[`${course}_${lessonNumber}`] || '';
    } catch {
      return '';
    }
  }

  function saveNote(course, lessonNumber, text) {
    try {
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      notes[`${course}_${lessonNumber}`] = text;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }

  // --- 5. Export / Import Backup Data ---
  function exportFullBackup() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      menus: getMenus(),
      users: window.HSKAuth ? window.HSKAuth.getAllUsers() : [],
      customLessons: {
        hsk1: getCustomLessons('hsk1'),
        hsk2: getCustomLessons('hsk2'),
        hsk3: getCustomLessons('hsk3')
      },
      bookmarks: getBookmarks()
    };
  }

  function importFullBackup(backupData) {
    if (!backupData || typeof backupData !== 'object') throw new Error('File sao lưu không hợp lệ.');
    if (Array.isArray(backupData.menus)) saveMenus(backupData.menus);
    if (backupData.customLessons) {
      if (Array.isArray(backupData.customLessons.hsk1)) saveCustomLessons('hsk1', backupData.customLessons.hsk1);
      if (Array.isArray(backupData.customLessons.hsk2)) saveCustomLessons('hsk2', backupData.customLessons.hsk2);
      if (Array.isArray(backupData.customLessons.hsk3)) saveCustomLessons('hsk3', backupData.customLessons.hsk3);
    }
    if (Array.isArray(backupData.bookmarks)) localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(backupData.bookmarks));
  }

  window.HSKData = {
    getMenus,
    saveMenus,
    addMenu,
    updateMenu,
    deleteMenu,
    getCustomLessons,
    upsertLesson,
    deleteLesson,
    getBookmarks,
    toggleBookmark,
    isBookmarked,
    getNote,
    saveNote,
    exportFullBackup,
    importFullBackup
  };
})();

