/**
 * Audio FX & Confetti Celebration System (Micro-Interactions)
 * Web Audio API Synthesizer (100% offline, không phụ thuộc file âm thanh ngoài)
 * Pure HTML5 Canvas Confetti Cannon (Hiệu ứng pháo hoa giấy rực rỡ khi hoàn thành/đúng)
 */
(() => {
  'use strict';

  let audioCtx = null;
  let isMuted = localStorage.getItem('hsk_sound_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Khởi tạo AudioContext khi người dùng tương tác lần đầu
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  /* ================================================================
     1. WEB AUDIO API SYNTHESIZER
     ================================================================ */

  // Âm thanh khi trả lời đúng (Chime 2 nốt trong trẻo C5 -> E5)
  function playCorrect() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Nốt 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Nốt 2: 659.25 Hz (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      gain2.gain.setValueAtTime(0.22, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.55);
    } catch (e) {
      // AudioContext bị chặn hoặc không khả dụng
    }
  }

  // Âm thanh khi trả lời sai (Thud nhẹ 180Hz -> 130Hz)
  function playWrong() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  // Âm thanh chiến thắng / hoàn thành bài học / thi đỗ (Fanfare 4 nốt C5 - E5 - G5 - C6)
  function playVictory() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.00, dur: 0.2 }, // C5
        { f: 659.25, t: 0.12, dur: 0.2 }, // E5
        { f: 783.99, t: 0.24, dur: 0.25 }, // G5
        { f: 1046.50, t: 0.40, dur: 0.65 } // C6
      ];

      notes.forEach(({ f, t, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.25, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur);
      });
    } catch (e) {}
  }

  // Âm thanh xúc giác bấm nút / lật thẻ (Subtle tactile click)
  function playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('hsk_sound_muted', String(isMuted));
    updateMuteIcons();
    return isMuted;
  }

  function updateMuteIcons() {
    const btns = document.querySelectorAll('.sound-toggle-btn');
    btns.forEach(btn => {
      btn.innerHTML = isMuted ? '🔇' : '🔊';
      btn.title = isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng';
    });
  }

  /* ================================================================
     2. PURE HTML5 CANVAS CONFETTI CANNON
     ================================================================ */
  let confettiCanvas = null;
  let confettiCtx = null;
  let particles = [];
  let animFrameId = null;

  const CONFETTI_COLORS = [
    '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#ef4444', '#fbbf24', '#6366f1'
  ];

  function getConfettiCanvas() {
    if (!confettiCanvas) {
      confettiCanvas = document.createElement('canvas');
      confettiCanvas.id = 'hskConfettiCanvas';
      confettiCanvas.style.position = 'fixed';
      confettiCanvas.style.inset = '0';
      confettiCanvas.style.width = '100vw';
      confettiCanvas.style.height = '100vh';
      confettiCanvas.style.pointerEvents = 'none';
      confettiCanvas.style.zIndex = '999999';
      document.body.appendChild(confettiCanvas);
      confettiCtx = confettiCanvas.getContext('2d');

      const resize = () => {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();
    }
    return confettiCanvas;
  }

  function launchConfetti(count = 90) {
    getConfettiCanvas();
    const w = confettiCanvas.width;
    const h = confettiCanvas.height;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: h * 0.35,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!animFrameId) {
      animFrameId = requestAnimationFrame(updateConfetti);
    }
  }

  function updateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42; // Gravity
      p.vx *= 0.98; // Air drag
      p.rotation += p.vRot;
      p.opacity -= 0.0075;

      if (p.opacity <= 0 || p.y > confettiCanvas.height + 20) {
        particles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;

      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    }

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(updateConfetti);
    } else {
      animFrameId = null;
      if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
  }

  window.HSKAudioFX = {
    playCorrect,
    playWrong,
    playVictory,
    playClick,
    confetti: launchConfetti,
    toggleMute,
    isMuted: () => isMuted
  };
})();

