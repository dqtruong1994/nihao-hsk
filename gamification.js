/**
 * Gamification & Audio Synthesis Engine
 * Cung cấp:
 * 1. Hiệu ứng âm thanh chuẩn Web Audio API (chime, error, tone contours)
 * 2. Pháo hoa ăn mừng (Canvas Confetti)
 * 3. Quản lý Streak chuẩn múi giờ GMT+7 và XP toàn cục
 */
(() => {
  'use strict';

  // --- 1. Web Audio FX ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration = 0.2, type = 'sine') {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  function playSuccessSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Hai nốt vui tươi C5 (523Hz) -> E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);
    } catch {}
  }

  function playErrorSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Phát âm chuẩn cao độ 4 thanh điệu tiếng Trung
  function playToneContour(tone) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.3, now);

      if (tone === 1) {
        // Thanh 1 (55): Cao độ ngang 260Hz
        osc.frequency.setValueAtTime(260, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (tone === 2) {
        // Thanh 2 (35): Lên giọng từ 200Hz -> 260Hz
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (tone === 3) {
        // Thanh 3 (214): Xuống trầm rồi lên lại 190 -> 130 -> 220Hz
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.52);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (tone === 4) {
        // Thanh 4 (51): Rơi nhanh dứt khoát 270Hz -> 130Hz
        osc.frequency.setValueAtTime(270, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch {}
  }

  // --- 2. Canvas Confetti ---
  function confetti() {
    let canvas = document.getElementById('hskConfettiCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'hskConfettiCanvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6657d9', '#ff4757', '#2ed573', '#ffa502', '#1e90ff', '#f368e0'];
    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 8,
        life: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // trọng lực
        p.rotation += p.rSpeed;
        p.life -= 0.015;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  // --- 3. Global Gamification Stats ---
  function addXP(amount) {
    try {
      const current = Number(localStorage.getItem('hskXP') || 0);
      const updated = current + amount;
      localStorage.setItem('hskXP', String(updated));
      const xpNode = document.getElementById('totalXP') || document.getElementById('xpStat');
      if (xpNode) xpNode.textContent = String(updated);
    } catch {}
  }

  window.Gamification = {
    playTone,
    playSuccessSound,
    playErrorSound,
    playToneContour,
    confetti,
    addXP
  };
})();
