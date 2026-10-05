// Interactive gaze: eyes, face, and body track the cursor
(function () {
  const orbs = () => Array.from(document.querySelectorAll(".orb"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let raf = 0;

  // Per-orb smoothed state
  const state = new WeakMap();

  function getState(orb) {
    if (!state.has(orb)) {
      state.set(orb, {
        pupilX: 0, pupilY: 0,
        gazeX: 0, gazeY: 0, gazeRot: 0,
        bodyX: 0, bodyY: 0, bodyRot: 0,
      });
    }
    return state.get(orb);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function update() {
    raf = 0;
    const list = orbs();
    for (const orb of list) {
      // Skip if off-screen (rough)
      const rect = orb.getBoundingClientRect();
      if (rect.bottom < -40 || rect.top > window.innerHeight + 40) continue;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Normalize by a soft range so nearby cursor has stronger effect
      const range = Math.max(rect.width * 4, 280);
      const nx = clamp(dx / range, -1, 1);
      const ny = clamp(dy / range, -1, 1);

      // Target offsets (SVG-ish units scaled via px on transform)
      const tPupilX = nx * 4.2;
      const tPupilY = ny * 3.2;
      const tGazeX = nx * 5;
      const tGazeY = ny * 4;
      const tGazeRot = nx * 4; // deg
      const tBodyX = nx * 3;
      const tBodyY = ny * 2.5;
      const tBodyRot = nx * 3.5;

      const s = getState(orb);
      // Smooth chase
      const k = 0.14;
      s.pupilX = lerp(s.pupilX, tPupilX, k);
      s.pupilY = lerp(s.pupilY, tPupilY, k);
      s.gazeX = lerp(s.gazeX, tGazeX, k * 0.9);
      s.gazeY = lerp(s.gazeY, tGazeY, k * 0.9);
      s.gazeRot = lerp(s.gazeRot, tGazeRot, k * 0.85);
      s.bodyX = lerp(s.bodyX, tBodyX, k * 0.7);
      s.bodyY = lerp(s.bodyY, tBodyY, k * 0.7);
      s.bodyRot = lerp(s.bodyRot, tBodyRot, k * 0.7);

      orb.style.setProperty("--pupil-x", s.pupilX.toFixed(2) + "px");
      orb.style.setProperty("--pupil-y", s.pupilY.toFixed(2) + "px");
      orb.style.setProperty("--gaze-x", s.gazeX.toFixed(2) + "px");
      orb.style.setProperty("--gaze-y", s.gazeY.toFixed(2) + "px");
      orb.style.setProperty("--gaze-rot", s.gazeRot.toFixed(2) + "deg");
      orb.style.setProperty("--body-x", s.bodyX.toFixed(2) + "px");
      orb.style.setProperty("--body-y", s.bodyY.toFixed(2) + "px");
      orb.style.setProperty("--body-rot", s.bodyRot.toFixed(2) + "deg");
    }
    raf = requestAnimationFrame(update);
  }

  function onMove(e) {
    if (e.touches && e.touches[0]) {
      mx = e.touches[0].clientX;
      my = e.touches[0].clientY;
    } else {
      mx = e.clientX;
      my = e.clientY;
    }
    if (!raf) raf = requestAnimationFrame(update);
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });

  // Keep animating while page is open so lerp settles
  raf = requestAnimationFrame(update);

  // When cursor leaves window, ease back toward center
  document.addEventListener("pointerleave", () => {
    mx = window.innerWidth / 2;
    my = window.innerHeight / 2;
  });
})();
