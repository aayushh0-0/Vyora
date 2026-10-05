/**
 * VYORA experience layer
 * Emotions, click-to-talk, node reactions, celebration, plan reveal,
 * attention cone, ambient section lighting, soft SFX, reduced-motion respect.
 */
(function () {
  const reduced = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // —— Soft Web Audio SFX ——
  let audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, gain) {
    const c = ctx();
    if (!c || reduced()) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.value = gain || 0.04;
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime;
    g.gain.setValueAtTime(gain || 0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  const sfx = {
    whoosh() { tone(280, 0.12, "sine", 0.03); setTimeout(() => tone(420, 0.1, "sine", 0.02), 40); },
    chime() { tone(660, 0.15, "triangle", 0.035); setTimeout(() => tone(990, 0.18, "triangle", 0.025), 80); },
    tick() { tone(800, 0.04, "square", 0.015); },
    success() {
      tone(523, 0.1, "triangle", 0.04);
      setTimeout(() => tone(659, 0.1, "triangle", 0.035), 90);
      setTimeout(() => tone(784, 0.18, "triangle", 0.03), 180);
    },
    soft() { tone(360, 0.08, "sine", 0.02); },
  };
  window.VYORASfx = sfx;

  // —— Emotion from text ——
  function emotionFromText(text, role) {
    const m = (text || "").toLowerCase();
    if (/congrat|pr\b|great job|nice work|streak|crush|awesome|proud|yes!/.test(m)) return "celebrating";
    if (/happy|good|love|excited|ready|let'?s go|motivat/.test(m)) return "happy";
    if (/tired|sore|pain|hurt|quit|give up|sad|anxious|stress|worried|concern/.test(m)) return "concerned";
    if (/form|camera|watch me|check my|squat|deadlift/.test(m)) return "listening";
    if (role === "user") return "listening";
    return "happy";
  }

  function setState(s, holdMs) {
    if (!window.VYORACharacter) return;
    VYORACharacter.setCharacterState(s);
    if (holdMs && s !== "idle") {
      clearTimeout(setState._t);
      setState._t = setTimeout(() => {
        if (VYORACharacter.controller.state === s) {
          VYORACharacter.setCharacterState("idle");
        }
      }, holdMs);
    }
  }

  // —— Simulated lip-sync while speaking ——
  let lipTimer = null;
  function startLipSync(durationMs) {
    if (!window.VYORACharacter) return;
    stopLipSync();
    if (reduced()) {
      VYORACharacter.setMouthAmplitude(0.35);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / durationMs;
      if (t >= 1) {
        VYORACharacter.setMouthAmplitude(0);
        lipTimer = null;
        return;
      }
      // Pseudo speech envelope
      const env = Math.sin(t * Math.PI) * (0.35 + 0.65 * Math.abs(Math.sin(now / 90)));
      VYORACharacter.setMouthAmplitude(0.15 + env * 0.7);
      lipTimer = requestAnimationFrame(tick);
    };
    lipTimer = requestAnimationFrame(tick);
  }
  function stopLipSync() {
    if (lipTimer) cancelAnimationFrame(lipTimer);
    lipTimer = null;
    if (window.VYORACharacter) VYORACharacter.setMouthAmplitude(0);
  }
  window.VYORALipSync = { start: startLipSync, stop: stopLipSync };

  // —— Click orb → talk ——
  function wireClickToTalk() {
    const orb = document.getElementById("orb");
    if (!orb) return;
    orb.style.cursor = "pointer";
    orb.title = "Tap to talk to VYORA";
    orb.addEventListener("click", (e) => {
      e.stopPropagation();
      sfx.soft();
      setState("listening", 4000);
      const status = document.getElementById("orbStatus");
      if (status) status.textContent = "Listening…";
      orb.classList.add("listen");
      // Scroll to chat and focus
      const input = document.getElementById("vyoraInput");
      const chatCard = input && input.closest(".card");
      if (chatCard) chatCard.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
      if (input) {
        input.focus();
        input.placeholder = "I'm listening — type or use the mic…";
      }
      // Optional mic
      const mic = document.getElementById("vyoraMic");
      if (mic && !mic.classList.contains("on")) {
        // don't auto-start mic (permission); just highlight
        mic.classList.add("pulse-hint");
        setTimeout(() => mic.classList.remove("pulse-hint"), 2000);
      }
      setTimeout(() => {
        orb.classList.remove("listen");
        if (status && status.textContent === "Listening…") status.textContent = "Ready";
      }, 4000);
    });
  }

  // —— Node hover reactions ——
  const nodeMood = {
    workout: "happy",
    diet: "idle",
    locator: "idle",
    community: "happy",
    ovula: "happy",
    business: "thinking",
  };
  function wireNodeHover() {
    document.querySelectorAll(".node[data-target]").forEach((node) => {
      node.addEventListener("mouseenter", () => {
        const t = node.dataset.target;
        sfx.tick();
        setState(nodeMood[t] || "idle", 1800);
        document.body.dataset.hoverNode = t || "";
      });
      node.addEventListener("mouseleave", () => {
        document.body.dataset.hoverNode = "";
      });
      node.addEventListener("click", () => sfx.whoosh());
    });
    document.querySelectorAll(".navbtn[data-target]").forEach((btn) => {
      btn.addEventListener("click", () => sfx.whoosh());
    });
  }

  // —— Attention cone (pointer distance to orb) ——
  function wireAttention() {
    function onMove(e) {
      const x = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      const y = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
      if (x == null || !window.VYORACharacter) return;
      VYORACharacter.controller.setAttentionFromPoint(x, y);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
  }

  // —— Section ambient + coach / OVULA presence ——
  function wireSectionPresence() {
    const apply = () => {
      const sec = document.body.dataset.section || "home";
      document.body.dataset.ambient = sec;
      if (!window.VYORACharacter) return;
      if (sec === "workout") {
        // coach mode: slightly more intense idle handled in controller
        const status = document.getElementById("orbStatus");
        // don't overwrite speaking
      } else if (sec === "ovula") {
        setState("happy", 2500);
      }
    };
    // Hook go() by observing body data-section
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === "data-section") apply();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-section"] });
    apply();
  }

  // —— Post-set celebration (workout checkoffs) ——
  function wireWorkoutCelebrate() {
    document.addEventListener("click", (e) => {
      const row = e.target.closest && e.target.closest(".exrow");
      if (!row) return;
      // Toggle done state
      if (e.target.matches("input[type=checkbox], .check, button.log-set")) {
        row.classList.toggle("done");
        if (row.classList.contains("done")) {
          sfx.success();
          setState("celebrating", 2200);
          triggerWave("orbWave");
          const status = document.getElementById("orbStatus");
          if (status) {
            status.textContent = "Nice work!";
            setTimeout(() => { if (status.textContent === "Nice work!") status.textContent = "Ready"; }, 2200);
          }
        }
      }
    });
  }

  // —— Enhance workout list with checkboxes if missing ——
  function enhanceWorkoutUI() {
    const list = document.getElementById("exList");
    if (!list) return;
    const obs = new MutationObserver(() => {
      list.querySelectorAll(".exrow").forEach((row) => {
        if (row.querySelector(".log-set")) return;
        const btn = document.createElement("button");
        btn.className = "btn ghost log-set";
        btn.type = "button";
        btn.textContent = "Log set ✓";
        btn.style.marginLeft = "8px";
        btn.style.fontSize = "12px";
        btn.style.padding = "4px 10px";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          row.classList.toggle("done");
          if (row.classList.contains("done")) {
            sfx.success();
            setState("celebrating", 2200);
            btn.textContent = "Done ✓";
            if (typeof triggerWave === "function") triggerWave("orbWave");
          } else {
            btn.textContent = "Log set ✓";
          }
        });
        row.appendChild(btn);
      });
    });
    obs.observe(list, { childList: true, subtree: true });
  }

  // —— Plan reveal ——
  function wirePlanReveal() {
    const btn = document.getElementById("pGenerate");
    if (!btn) return;
    btn.addEventListener("click", () => {
      // After plan.js runs (same tick), celebrate when results visible
      setTimeout(() => {
        const res = document.getElementById("planResults");
        if (res && res.style.display !== "none") {
          sfx.success();
          setState("celebrating", 3500);
          if (typeof triggerWave === "function") triggerWave("orbWave");
          const status = document.getElementById("orbStatus");
          if (status) {
            status.textContent = "Plan ready!";
            setTimeout(() => { if (status.textContent === "Plan ready!") status.textContent = "Ready"; }, 3000);
          }
        }
      }, 100);
    });
  }

  // —— Form-check phrase in chat (camera handoff) ——
  window.VYORAFormCheck = function (msg) {
    if (/form|camera|watch me|check my (squat|form|lift)|how'?s my/.test((msg || "").toLowerCase())) {
      setState("listening", 5000);
      const status = document.getElementById("orbStatus");
      if (status) status.textContent = "I'm watching…";
      document.body.classList.add("form-check");
      setTimeout(() => {
        document.body.classList.remove("form-check");
        if (status && status.textContent === "I'm watching…") status.textContent = "Ready";
      }, 5000);
      return true;
    }
    return false;
  };

  // —— Public emotion helper for voice.js ——
  window.VYORAEmotion = {
    fromText: emotionFromText,
    set: setState,
  };

  function boot() {
    wireClickToTalk();
    wireNodeHover();
    wireAttention();
    wireSectionPresence();
    wireWorkoutCelebrate();
    enhanceWorkoutUI();
    wirePlanReveal();
    console.info("[VYORA] experience layer ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
