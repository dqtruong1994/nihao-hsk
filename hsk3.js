(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const memory = new Map();
  const read = (key, fallback = '') => { try { return localStorage.getItem(key) ?? memory.get(key) ?? fallback; } catch { return memory.get(key) ?? fallback; } };
  const write = (key, value) => { memory.set(key, String(value)); try { localStorage.setItem(key, String(value)); } catch {} };
  const readJSON = (key, fallback) => { try { return JSON.parse(read(key, 'null')) ?? fallback; } catch { return fallback; } };
  const lessonNumbers = value => Array.isArray(value) ? [...new Set(value)].filter(x => Number.isInteger(x) && x >= 0 && x < 20).sort((a, b) => a - b) : [];
  const storedInitialLesson = read('hsk3Lesson', null), hadStoredLesson = storedInitialLesson !== null;
  const initialLesson = parseInt(storedInitialLesson ?? '0', 10);
  let lessons = [], course = null, current = Number.isInteger(initialLesson) ? Math.max(0, Math.min(19, initialLesson)) : 0;
  let completed = lessonNumbers(readJSON('hsk3done', []));
  let xp = Math.max(0, Math.min(1000000, Number(read('hsk3XP', '0')) || 0));
  let teacherOpen = read('hsk3TeacherOpen') === '1', currentTab = 'learn', profileVersion = -1;
  let sentenceOrder = [], sentencePicked = [], matchWords = [], matchOrder = [], selectedWord = null, selectedMeaning = null, matched = new Set();
  let quizItems = [], lastQuizSignature = null, lastQuizEventId = null, quizGraded = false, reviewOnly = false;
  let loading = false, returnFocus = null, learningInteracted = false, receivedCourseProfile = false;

  function reviews() {
    const value = readJSON('hsk3ReviewWords', {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  function dueWords() { return Object.values(reviews()).filter(value => Number.isFinite(value) && value <= Date.now()).length; }
  function notifyParent() {
    const score = read('hsk3score');
    window.HSKSync?.snapshot({ course: 'hsk3', completedLessons: completed, activeLesson: current, xp, lastScore: /^\d+%$/.test(score) ? parseInt(score, 10) : null });
    if (window.parent !== window) window.parent.postMessage({ type: 'hsk-progress', course: 'hsk3', completed: completed.length, xp, due: dueWords() }, location.origin);
  }
  function updateStats() {
    const percent = Math.round(completed.length / 20 * 100);
    $('progressPercent').textContent = percent + '%';
    $('progressBar').setAttribute('aria-valuenow', String(percent));
    $('progressBar').firstElementChild.style.width = percent + '%';
    $('completedCount').textContent = completed.length + '/20';
    $('lastScore').textContent = read('hsk3score', '—');
    $('xpStat').textContent = String(xp);
    $('reviewStat').textContent = String(dueWords());
    const streak = Math.max(0, Number(read('hsk3Streak', '0')) || 0);
    $('streakStat').textContent = String(streak);
    const badges = [completed.length >= 1 && '🌱 Bước đầu HSK 3', completed.length >= 10 && '🌿 Nửa chặng đường', completed.length === 20 && '🏆 Hoàn thành HSK 3', streak >= 3 && '🔥 Ba ngày liên tiếp'].filter(Boolean);
    $('badgeStat').textContent = String(badges.length);
    $('achievementBar').innerHTML = badges.map(label => '<span class="achievement">' + escape(label) + '</span>').join('');
    const name = read('hskStudentName').trim();
    $('brandName').textContent = name ? 'Chào ' + name : 'Góc học HSK 3';
  }
  function markStudy() {
    if (!read('hskStudentName').trim()) return;
    const date = offset => new Date(Date.now() + offset).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    const today = date(0), previous = read('hsk3LastStudy');
    if (previous !== today) {
      write('hsk3Streak', previous === date(-86400000) ? (Number(read('hsk3Streak', '0')) || 0) + 1 : 1);
      write('hsk3LastStudy', today);
    }
  }
  function notice(message) {
    $('courseNotice').textContent = message;
    $('courseNotice').hidden = !message;
  }
  function showWelcome() {
    returnFocus = document.activeElement;
    $('studentName').value = read('hskStudentName');
    $('welcomeOverlay').hidden = false;
    $('learningApp').inert = true;
    $('studentName').focus();
  }
  function hideWelcome() {
    const wasOpen = !$('welcomeOverlay').hidden;
    $('welcomeOverlay').hidden = true;
    $('learningApp').inert = false;
    if (wasOpen) (returnFocus?.isConnected && returnFocus !== document.body ? returnFocus : $('lessonHeading')).focus();
  }
  function shuffle(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    if (result.length > 1 && result.every((value, index) => value === values[index])) result.push(result.shift());
    return result;
  }
  const audioButtons = text => window.HSKAudio.controls({ text, label: text });
  const list = values => '<ul>' + values.map(value => '<li>' + escape(value) + '</li>').join('') + '</ul>';
  function renderNav() {
    $('nav').innerHTML = lessons.map((lesson, index) => {
      const locked = index > 0 && !completed.includes(index - 1) && !completed.includes(index) && !teacherOpen;
      return '<button type="button" class="week' + (locked ? ' lock' : '') + '" data-action="lesson" data-index="' + index + '"' + (index === current ? ' aria-current="page"' : '') + '><small>Bài ' + (index + 1) + (completed.includes(index) ? ' · ✓ Đã hoàn thành' : locked ? ' · 🔒' : '') + '</small>' + escape(lesson.title) + '</button>';
    }).join('');
    $('teacherMode').textContent = teacherOpen ? 'Học theo thứ tự' : 'Mở tất cả bài';
    $('teacherMode').setAttribute('aria-pressed', String(teacherOpen));
    if (window.HSKMockExam) {
      window.HSKMockExam.attachExamButton('hsk3', 'nav');
    }
  }
  function renderVocabulary() {
    const saved = reviews(), now = Date.now(), vocabulary = lessons[current].vocabulary;
    const indexes = vocabulary.map((_, index) => index).filter(index => !reviewOnly || (Number.isFinite(saved[vocabulary[index][0]]) && saved[vocabulary[index][0]] <= now));
    $('vocabularyCards').innerHTML = indexes.length ? indexes.map(index => {
      const [hanzi, pinyin, hv, meaning, icon] = vocabulary[index];
      if (window.SRSEngine) window.SRSEngine.registerCard(hanzi, pinyin, hv, meaning, 'HSK 3');
      return '<article class="vcard" data-vocab="' + index + '">' + (saved[hanzi] <= now ? '<span class="due-tag">Đến hạn ôn</span>' : '') + '<button type="button" class="vocab-flip" data-action="flip-vocab" data-index="' + index + '" aria-expanded="false"><span class="vpic" aria-hidden="true">' + escape(icon) + '</span><span class="hanzi" lang="zh">' + escape(hanzi) + '</span><span class="pinyin">' + escape(pinyin) + '</span><span class="vocab-answer" hidden><span class="meaning">' + escape(meaning) + '</span><br><span class="hv">Hán Việt: ' + escape(hv) + '</span></span><span class="vocab-hint">Chạm để xem nghĩa</span></button><div class="button-row">' + audioButtons(hanzi) + '<button type="button" class="btn" style="padding:4px 10px;font-size:12px;margin:4px 0 0;" onclick="event.stopPropagation();window.HanziPad?.open(\'' + escape(hanzi) + '\',\'' + escape(pinyin) + '\',\'' + escape(meaning) + '\')">✍️ Tập viết</button></div><div class="memory-row" aria-label="Lên lịch ôn từ"><button type="button" class="memory-btn" data-action="remember" data-index="' + index + '" data-days="1">Chưa nhớ · 1 ngày</button><button type="button" class="memory-btn" data-action="remember" data-index="' + index + '" data-days="3">Khá nhớ · 3 ngày</button><button type="button" class="memory-btn" data-action="remember" data-index="' + index + '" data-days="7">Đã nhớ · 7 ngày</button></div><p class="memory-status small mut" aria-live="polite"></p></article>';
    }).join('') : '<p class="box">Bài này chưa có từ đến hạn ôn. Chọn “Xem tất cả từ” để học tiếp.</p>';
    $('reviewFilter').textContent = reviewOnly ? 'Xem tất cả từ' : 'Chỉ xem từ đến hạn';
    $('reviewFilter').setAttribute('aria-pressed', String(reviewOnly));
  }
  function renderLearn(lesson) {
    $('learn').innerHTML = '<h2>Mục tiêu bài học</h2>' + list(lesson.objectives) + '<h2>' + lesson.vocabulary.length + ' từ vựng trong chủ đề</h2><p class="mut small">Đọc Hán tự và Pinyin trước, chạm thẻ để kiểm tra nghĩa rồi chọn thời gian ôn lại.</p><div class="review-summary"><span>Ôn theo nhịp 1–3–7 ngày, tùy mức độ ghi nhớ.</span><button type="button" class="secondary small" id="reviewFilter" data-action="review-filter">Chỉ xem từ đến hạn</button></div><div id="vocabularyCards" class="vocab-grid"></div><p class="speak-note">Chọn Nghe hoặc Nghe chậm để đọc theo từng từ, câu. Bấm lại nút đang phát để dừng; giọng đọc tiếng Trung tùy thiết bị.</p><h2>Ngữ pháp và cách dùng</h2>' + lesson.grammar.map(([title, pattern, explanation, hanzi, pinyin, meaning], index) => '<article class="grammar-card"><h3>' + (index + 1) + '. ' + escape(title) + '</h3><div class="grammar-pattern">' + escape(pattern) + '</div><p>' + escape(explanation) + '</p><div class="grammar-example"><p class="zh" lang="zh">' + escape(hanzi) + '</p><p class="pinyin">' + escape(pinyin) + '</p><p>' + escape(meaning) + '</p>' + audioButtons(hanzi) + '</div></article>').join('') + '<h2>Đọc hiểu ngắn</h2><article class="reading"><p class="zh" lang="zh">' + escape(lesson.reading.hanzi) + '</p><div class="button-row">' + audioButtons(lesson.reading.hanzi) + '</div><p class="pinyin">' + escape(lesson.reading.pinyin) + '</p><p class="translation">' + escape(lesson.reading.meaning) + '</p></article><button type="button" class="btn" data-action="go-tab" data-target="practice">Thực hành bài này →</button>';
    renderVocabulary();
  }
  function renderPlan(lesson) {
    const minutes = lesson.lessonPlan.reduce((sum, phase) => sum + phase.minutes, 0);
    $('plan').innerHTML = '<h2>Giáo án · Bài ' + (current + 1) + '</h2><div class="plan-overview"><span>⏱ ' + minutes + ' phút</span><span>🎯 ' + lesson.objectives.length + ' mục tiêu</span><span>👥 Học cùng giáo viên hoặc tự học</span></div><h2>Mục tiêu đầu ra</h2>' + list(lesson.objectives) + '<h2>Chuẩn bị</h2>' + list(lesson.preparation) + '<h2>Tiến trình buổi học</h2>' + lesson.lessonPlan.map((phase, index) => '<article class="plan-step"><h3><span>' + (index + 1) + '. ' + escape(phase.title) + '</span><small>' + phase.minutes + ' phút</small></h3><p><strong>Giáo viên:</strong> ' + escape(phase.teacher) + '</p><p><strong>Học viên:</strong> ' + escape(phase.learner) + '</p></article>').join('') + '<div class="box"><h3>Bài tập về nhà</h3><p>' + escape(lesson.homework) + '</p></div><p class="mut small">Khi tự học, bạn có thể tự đọc câu hỏi, nói thành tiếng và đối chiếu với ví dụ. Kiểm tra cuối bài có ' + quizItems.length + ' câu, đạt từ 85% số câu đúng.</p><details class="source-links"><summary>Phạm vi giáo án và tài liệu tham khảo</summary><p>' + escape(course.description) + '</p><ul>' + (course.sources || []).filter(source => /^https:\/\//.test(source.url)).map(source => '<li><a href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer">' + escape(source.label) + '</a></li>').join('') + '</ul></details>';
  }
  function renderSentence() {
    const tokens = lessons[current].sentenceTokens;
    $('wordBank').innerHTML = sentenceOrder.map(index => '<button type="button" class="token" lang="zh" data-action="pick-token" data-index="' + index + '"' + (sentencePicked.includes(index) ? ' disabled' : '') + '>' + escape(tokens[index]) + '</button>').join('');
    $('answerZone').innerHTML = sentencePicked.length ? sentencePicked.map((index, position) => '<button type="button" class="token" lang="zh" data-action="remove-token" data-index="' + position + '" aria-label="Bỏ từ ' + escape(tokens[index]) + '">' + escape(tokens[index]) + '</button>').join('') : '<span class="mut small">Chọn các cụm từ theo đúng thứ tự…</span>';
  }
  function renderMatching() {
    const button = (index, side) => '<button type="button" class="match-card' + (matched.has(index) ? ' done' : (side === 'word' ? selectedWord : selectedMeaning) === index ? ' selected' : '') + '" data-action="match" data-side="' + side + '" data-index="' + index + '"' + (matched.has(index) ? ' disabled' : '') + (side === 'word' ? ' lang="zh"' : '') + '>' + (matched.has(index) ? '✓ ' : '') + escape(matchWords[index][side === 'word' ? 0 : 3]) + '</button>';
    $('matchingGame').innerHTML = '<div class="match-column" aria-label="Từ tiếng Trung">' + matchWords.map((_, index) => button(index, 'word')).join('') + '</div><div class="match-column" aria-label="Nghĩa tiếng Việt">' + matchOrder.map(index => button(index, 'meaning')).join('') + '</div>';
  }
  function renderPractice(lesson) {
    sentencePicked = [];
    sentenceOrder = shuffle(lesson.sentenceTokens.map((_, index) => index));
    const seen = new Set();
    matchWords = lesson.vocabulary.filter(word => { const key = word[3].trim().toLocaleLowerCase('vi'); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 4);
    matchOrder = shuffle(matchWords.map((_, index) => index));
    selectedWord = selectedMeaning = null; matched = new Set();
    $('practice').innerHTML = '<h2>Luyện nói và vận dụng</h2>' + list(lesson.practice) + '<div class="mistake-box"><h3>Lỗi dễ nhầm</h3><p class="zh wrong" lang="zh">' + escape(lesson.mistake.wrong) + '</p><p class="zh right" lang="zh">' + escape(lesson.mistake.correct) + '</p>' + audioButtons(lesson.mistake.correct) + '<p>' + escape(lesson.mistake.explanation) + '</p></div><section class="activity"><h3>Sắp xếp câu</h3><p>' + escape(lesson.sentenceMeaning) + '</p><p class="small mut">Chọn các cụm từ. Chạm một cụm trong ô trả lời để bỏ chọn.</p><div id="wordBank" class="word-bank"></div><div id="answerZone" class="answer-zone" aria-label="Câu trả lời của bạn"></div><div class="button-row"><button type="button" class="btn" data-action="check-sentence">Kiểm tra câu</button><button type="button" class="secondary" data-action="reset-sentence">Làm lại</button></div><p id="sentenceResult" class="activity-message" aria-live="polite"></p></section><section class="activity"><h3>Ghép từ và nghĩa</h3><p class="small mut">Chọn một từ tiếng Trung và nghĩa tiếng Việt tương ứng.</p><div id="matchingGame" class="match-grid"></div><p id="matchResult" class="activity-message" aria-live="polite"></p></section><h2>Hội thoại theo vai</h2><button type="button" class="secondary small" data-action="dialogue-translation" aria-pressed="false">Ẩn nghĩa tiếng Việt</button><div id="dialogue" class="dialogue">' + lesson.dialogue.map(([speaker, hanzi, pinyin, meaning]) => '<article class="dialogue-line"><div class="speaker">' + escape(speaker) + '</div><p class="zh" lang="zh">' + escape(hanzi) + '</p><p class="pinyin">' + escape(pinyin) + '</p>' + audioButtons(hanzi) + '<p class="translation">' + escape(meaning) + '</p></article>').join('') + '</div><div class="box"><h3>Bài tập về nhà</h3><p>' + escape(lesson.homework) + '</p></div><button type="button" class="btn" data-action="go-tab" data-target="quiz">Làm kiểm tra cuối bài →</button>';
    renderSentence(); renderMatching();
  }
  function uniqueQuiz(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = item.question.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  function renderQuiz() {
    lastQuizSignature = null; lastQuizEventId = null; quizGraded = false;
    $('quiz').innerHTML = '<div class="test-head"><h2>Kiểm tra cuối bài · ' + quizItems.length + ' câu</h2><span id="quizProgress">Đã trả lời 0/' + quizItems.length + '</span></div><p class="mut small">Mỗi câu có một đáp án đúng. Cần đúng ít nhất ' + Math.ceil(quizItems.length * .85) + '/' + quizItems.length + ' câu để hoàn thành bài. Số câu thay đổi theo nội dung từng bài.</p><form id="quizForm">' + quizItems.map((item, index) => '<fieldset class="quiz-question" id="question-' + index + '"><legend>' + (index + 1) + '. ' + escape(item.question) + '</legend>' + item.choices.map((choice, choiceIndex) => '<label class="opt"><input type="radio" name="t' + index + '" value="' + choiceIndex + '"><span>' + escape(choice) + '</span></label>').join('') + '<div id="feedback-' + index + '" class="question-feedback" hidden></div></fieldset>').join('') + '<button class="btn" type="submit">Chấm bài</button><div id="quizResult" role="status" class="test-result" hidden></div></form>';
    $('quizForm').addEventListener('submit', gradeQuiz);
    $('quizForm').addEventListener('change', () => {
      learningInteracted = true;
      const answered = quizItems.filter((_, index) => $('quizForm').querySelector('input[name="t' + index + '"]:checked')).length;
      $('quizProgress').textContent = 'Đã trả lời ' + answered + '/' + quizItems.length;
      if (quizGraded) {
        quizItems.forEach((_, index) => { $('feedback-' + index).hidden = true; $('question-' + index).classList.remove('correct', 'incorrect'); });
        $('quizResult').className = 'test-result';
        $('quizResult').textContent = 'Bạn đã đổi đáp án. Chấm lại để cập nhật kết quả.';
        quizGraded = false;
      }
    });
  }
  function gradeQuiz(event) {
    event.preventDefault();
    learningInteracted = true;
    const total = quizItems.length;
    const answers = quizItems.map((_, index) => $('quizForm').querySelector('input[name="t' + index + '"]:checked')?.value ?? null);
    const result = $('quizResult'); result.hidden = false;
    if (!total || answers.some(value => value === null)) {
      result.className = 'test-result';
      result.textContent = total ? 'Bạn hãy trả lời đủ ' + total + ' câu trước khi chấm bài.' : 'Bài kiểm tra đang được cập nhật.';
      const missing = answers.indexOf(null);
      if (missing >= 0) $('question-' + missing).querySelector('input').focus();
      return;
    }
    let correct = 0;
    quizItems.forEach((item, index) => {
      const isCorrect = item.choices[Number(answers[index])] === item.correct;
      if (isCorrect) correct++;
      $('question-' + index).classList.toggle('correct', isCorrect);
      $('question-' + index).classList.toggle('incorrect', !isCorrect);
      const feedback = $('feedback-' + index); feedback.hidden = false;
      feedback.innerHTML = '<strong class="' + (isCorrect ? 'ok' : 'bad') + '">' + (isCorrect ? '✓ Đúng' : 'Cần xem lại') + ' · ' + escape(item.correct) + '</strong><p>' + escape(item.explanation) + '</p>';
    });
    const score = Math.round(correct / total * 100), passed = correct * 100 >= total * 85;
    if (passed && window.Gamification) { window.Gamification.confetti(); window.Gamification.playSuccessSound(); }
    else if (window.Gamification) { window.Gamification.playErrorSound(); }
    const exactDisplay = (correct / total * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    const newlyCompleted = passed && !completed.includes(current);
    if (newlyCompleted) { completed.push(current); completed.sort((a, b) => a - b); xp = Math.min(1000000, xp + 30); }
    write('hsk3score', score + '%'); write('hsk3done', JSON.stringify(completed)); write('hsk3XP', xp);
    const signature = JSON.stringify(answers);
    if (signature !== lastQuizSignature) {
      lastQuizSignature = signature;
      lastQuizEventId = window.crypto?.randomUUID?.() || 'hsk3_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
      window.HSKSync?.attempt({ eventId: lastQuizEventId, course: 'hsk3', lesson: current, correct, total, score });
    }
    result.className = 'test-result ' + (passed ? 'pass' : 'fail');
    result.innerHTML = '<strong>' + correct + '/' + total + ' câu đúng · ' + exactDisplay + '%</strong><p>' + (passed ? 'Bạn đã hoàn thành bài này.' + (newlyCompleted ? ' +30 XP!' : '') : 'Bạn chưa đạt 85%. Xem giải thích từng câu, ôn lại rồi thử tiếp nhé.') + '</p>' + (passed && current < lessons.length - 1 ? '<button type="button" class="btn" data-action="lesson" data-index="' + (current + 1) + '">Bài tiếp theo →</button>' : '');
    quizGraded = true; markStudy(); renderNav(); updateStats(); notifyParent();
    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function switchTab(tab, focus = false) {
    if (!['learn', 'plan', 'practice', 'quiz', 'textbook'].includes(tab)) return;
    if (currentTab !== tab) window.HSKAudio?.stop();
    currentTab = tab;
    document.querySelectorAll('[data-tab]').forEach(button => {
      const selected = button.dataset.tab === tab;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      $(button.dataset.tab).hidden = !selected;
    });
    if (tab === 'textbook') {
      window.HSKTextbook?.syncLesson(current + 1, 3);
    }
    if (focus) $('tab-' + tab).focus();
  }
  function openLesson(index, userAction = false) {
    if (!Number.isInteger(index) || index < 0 || index >= lessons.length) return;
    if (userAction) learningInteracted = true;
    if (userAction && index > 0 && !completed.includes(index - 1) && !completed.includes(index) && !teacherOpen) {
      notice('Hoàn thành bài ' + index + ' trước hoặc chọn “Mở tất cả bài” trong danh sách để học chủ đề này.');
      return;
    }
    window.HSKAudio?.stop();
    const host = document.getElementById('mainExamHost');
    if (host) host.hidden = true;
    document.querySelectorAll('.hero, #lessonContent, .stats, .gamify').forEach(el => el.hidden = false);
    const ach = document.getElementById('achievementBar');
    if (ach) ach.hidden = false;
    current = index; write('hsk3Lesson', current); write('hskLastCourse', 'hsk3');
    const lesson = lessons[current];
    quizItems = uniqueQuiz(lesson.quiz).map(item => ({ ...item, choices: shuffle(item.choices) })); reviewOnly = false;
    $('lessonHeading').textContent = 'Bài ' + (current + 1) + ' · ' + lesson.title;
    $('lessonTopic').textContent = lesson.topic[0]; $('lessonPinyin').textContent = lesson.topic[1]; $('lessonVi').textContent = lesson.topic[2];
    $('description').textContent = lesson.description;
    $('topicAudio').innerHTML = audioButtons(lesson.topic[0]);
    renderNav(); renderLearn(lesson); renderPlan(lesson); renderPractice(lesson); renderQuiz();
    switchTab(userAction ? 'learn' : currentTab); $('lessonContent').hidden = false; notice('');
    $('lessonNavigation').classList.remove('open'); $('lessonMenu').setAttribute('aria-expanded', 'false');
    window.HSKTextbook?.syncLesson(current + 1, 3);
    window.dispatchEvent(new CustomEvent('hsk-lesson-changed', { detail: { level: 3, lesson: current + 1 } }));
    markStudy(); updateStats(); notifyParent();
    if (userAction) { window.scrollTo({ top: 0, behavior: 'smooth' }); $('lessonHeading').focus({ preventScroll: true }); }
  }
  function awardActivity(activity, points) {
    const key = 'hsk3Mini_' + current, raw = readJSON(key, {}), awards = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    if (awards[activity]) return false;
    awards[activity] = true; write(key, JSON.stringify(awards)); xp = Math.min(1000000, xp + points); write('hsk3XP', xp);
    markStudy(); updateStats(); notifyParent(); return true;
  }
  async function loadCourse() {
    if (loading) return;
    loading = true; notice('');
    try {
      const response = await fetch('hsk3-lessons.json');
      if (!response.ok) throw new Error('Không tải được nội dung.');
      const data = await response.json();
      if (!Array.isArray(data.lessons) || data.lessons.length !== 12 || data.lessons.some(lesson => !Array.isArray(lesson.quiz) || !lesson.quiz.length || lesson.quiz.some(item => !Array.isArray(item.choices) || !item.choices.includes(item.correct)))) throw new Error('Giáo án đang được cập nhật.');
      course = data; lessons = data.lessons;
      openLesson(current);
      if (window.HSKMockExam && localStorage.getItem('hskOpenExam') === 'hsk3') {
        localStorage.removeItem('hskOpenExam');
        setTimeout(() => document.querySelector('.mock-exam-btn[data-level="hsk3"]')?.click(), 100);
      }
    } catch {
      $('lessonHeading').textContent = 'Chưa tải được giáo án HSK 3';
      $('courseNotice').hidden = false;
      $('courseNotice').innerHTML = 'Kiểm tra kết nối rồi thử tải lại. Tiến độ đã lưu của bạn vẫn còn. <button type="button" class="secondary" data-action="retry">Tải lại giáo án</button>';
    } finally { loading = false; }
  }

  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]');
    if (tab) { learningInteracted = true; switchTab(tab.dataset.tab); return; }
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const index = Number(button.dataset.index), action = button.dataset.action;
    if (action === 'retry') { loadCourse(); return; }
    if (!lessons.length) return;
    learningInteracted = true;
    if (action === 'lesson') openLesson(index, true);
    else if (action === 'go-tab') { switchTab(button.dataset.target, true); $('lessonContent').scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    else if (action === 'flip-vocab') {
      const answer = button.querySelector('.vocab-answer'); answer.hidden = !answer.hidden;
      button.setAttribute('aria-expanded', String(!answer.hidden));
      button.querySelector('.vocab-hint').textContent = answer.hidden ? 'Chạm để xem nghĩa' : 'Chạm để ẩn nghĩa';
    } else if (action === 'review-filter') { reviewOnly = !reviewOnly; renderVocabulary(); }
    else if (action === 'remember') {
      const days = Number(button.dataset.days), word = lessons[current].vocabulary[index]?.[0];
      if (!word || ![1, 3, 7].includes(days)) return;
      const saved = reviews(); saved[word] = Date.now() + days * 86400000; write('hsk3ReviewWords', JSON.stringify(saved));
      const card = button.closest('.vcard'); card.querySelectorAll('.memory-btn').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      card.querySelector('.memory-status').textContent = 'Đã hẹn ôn lại sau ' + days + ' ngày.';
      card.querySelector('.due-tag')?.remove(); markStudy(); updateStats(); notifyParent();
    } else if (action === 'pick-token') { if (!sentencePicked.includes(index)) sentencePicked.push(index); renderSentence(); $('sentenceResult').textContent = ''; }
    else if (action === 'remove-token') { sentencePicked.splice(index, 1); renderSentence(); $('sentenceResult').textContent = ''; }
    else if (action === 'reset-sentence') { sentencePicked = []; renderSentence(); $('sentenceResult').textContent = ''; }
    else if (action === 'check-sentence') {
      const lesson = lessons[current], tokens = lesson.sentenceTokens;
      const normalize = value => String(value).normalize('NFC').replace(/[\s，。！？、；：“”‘’（）【】《》〈〉「」『』…—,.!?;:"'()[\]]/g, '');
      const accepted = [tokens.join(''), ...(Array.isArray(lesson.sentenceAlternatives) ? lesson.sentenceAlternatives : [])].map(normalize);
      const correct = sentencePicked.length === tokens.length && accepted.includes(normalize(sentencePicked.map(value => tokens[value]).join('')));
      $('sentenceResult').className = 'activity-message ' + (correct ? 'ok' : 'bad');
      $('sentenceResult').textContent = correct ? '✓ Đúng rồi! ' + tokens.join('') + (awardActivity('sentence', 5) ? ' · +5 XP' : '') : sentencePicked.length < tokens.length ? 'Bạn cần dùng đủ các cụm từ.' : 'Thử xem lại thứ tự. Câu mẫu: ' + tokens.join('');
    } else if (action === 'match') {
      if (matched.has(index)) return;
      if (button.dataset.side === 'word') selectedWord = index; else selectedMeaning = index;
      if (selectedWord !== null && selectedMeaning !== null) {
        if (selectedWord === selectedMeaning) { matched.add(selectedWord); $('matchResult').textContent = '✓ Ghép đúng ' + matched.size + '/' + matchWords.length + ' cặp.'; $('matchResult').className = 'activity-message ok'; }
        else { $('matchResult').textContent = 'Hai thẻ này chưa khớp. Bạn thử lại nhé.'; $('matchResult').className = 'activity-message bad'; }
        selectedWord = selectedMeaning = null;
        if (matched.size === matchWords.length && awardActivity('matching', 5)) $('matchResult').textContent += ' +5 XP!';
      }
      renderMatching();
    } else if (action === 'dialogue-translation') {
      const hidden = $('dialogue').classList.toggle('hide-vi'); button.textContent = hidden ? 'Hiện nghĩa tiếng Việt' : 'Ẩn nghĩa tiếng Việt'; button.setAttribute('aria-pressed', String(hidden));
    }
  });
  document.querySelector('.tabs').addEventListener('keydown', event => {
    const tabs = [...document.querySelectorAll('[data-tab]')], index = tabs.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    switchTab(tabs[next].dataset.tab, true);
  });
  $('welcomeForm').addEventListener('submit', async event => {
    event.preventDefault(); const name = $('studentName').value.trim().replace(/\s+/g, ' ');
    if (!name || name.length > 30) { $('welcomeError').textContent = 'Bạn hãy nhập tên từ 1 đến 30 ký tự.'; return; }
    write('hskStudentName', name); $('welcomeError').textContent = ''; hideWelcome(); markStudy(); updateStats();
    await window.HSKSync?.setName(name); notifyParent();
  });
  $('welcomeOverlay').addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const input = $('studentName'), submit = $('welcomeForm').querySelector('button');
    if (event.shiftKey && document.activeElement === input) { event.preventDefault(); submit.focus(); }
    else if (!event.shiftKey && document.activeElement === submit) { event.preventDefault(); input.focus(); }
  });
  $('editName').addEventListener('click', showWelcome);
  $('teacherMode').addEventListener('click', () => { learningInteracted = true; teacherOpen = !teacherOpen; write('hsk3TeacherOpen', teacherOpen ? '1' : '0'); renderNav(); notice(teacherOpen ? 'Đã mở cả 12 bài để bạn chọn chủ đề cần học.' : 'Đã bật lộ trình học theo thứ tự.'); });
  $('lessonMenu').addEventListener('click', () => { const open = $('lessonNavigation').classList.toggle('open'); $('lessonMenu').setAttribute('aria-expanded', String(open)); });
  document.addEventListener('hsk-audio-start', () => { learningInteracted = true; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.HSKAudio?.stop(); });
  addEventListener('storage', event => {
    if (['hsk3done', 'hsk3XP', 'hsk3score', 'hsk3ReviewWords', 'hskStudentName'].includes(event.key)) {
      completed = lessonNumbers(readJSON('hsk3done', [])); xp = Math.max(xp, Number(read('hsk3XP', '0')) || 0);
      if (read('hskStudentName').trim()) hideWelcome(); renderNav(); updateStats();
    }
  });
  if (read('hskStudentName').trim()) hideWelcome(); else showWelcome();
  window.HSKSync?.subscribe(status => {
    document.querySelectorAll('[data-sync-status]').forEach(node => { node.textContent = status.message; node.dataset.state = status.state; });
    if (profileVersion === status.profileVersion || !status.student) return;
    profileVersion = status.profileVersion;
    const remote = status.student.hsk3;
    const restoredLesson = !receivedCourseProfile && remote && !hadStoredLesson && !learningInteracted && Number.isInteger(remote.activeLesson) && remote.activeLesson >= 0 && remote.activeLesson < 12 ? remote.activeLesson : null;
    if (remote) receivedCourseProfile = true;
    completed = lessonNumbers(readJSON('hsk3done', [])); xp = Math.max(xp, Number(read('hsk3XP', '0')) || 0);
    if (read('hskStudentName').trim()) hideWelcome();
    if (restoredLesson !== null) {
      current = restoredLesson; write('hsk3Lesson', current);
      if (lessons.length) { openLesson(current); return; }
      notifyParent();
    }
    markStudy(); updateStats(); if (lessons.length) renderNav();
  });
  updateStats(); loadCourse();
})();
