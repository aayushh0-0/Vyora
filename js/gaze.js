// Legacy gaze entry — cursor tracking is owned by VYORACharacter + Live2D runtime.
// Kept so existing script tags remain valid without sprite-sheet logic.
(function () {
  // Optional: map orb talk/listen/think classes to character states
  const map = {
    talk: "speaking",
    listen: "listening",
    think: "thinking",
  };

  const observer = new MutationObserver((mutations) => {
    if (!window.VYORACharacter) return;
    for (const m of mutations) {
      if (m.type !== "attributes" || m.attributeName !== "class") continue;
      const el = m.target;
      if (!el.classList || !el.classList.contains("orb")) continue;
      let state = "idle";
      for (const [cls, st] of Object.entries(map)) {
        if (el.classList.contains(cls)) {
          state = st;
          break;
        }
      }
      // Prefer primary hero orb for global state
      if (el.id === "orb" || el.id === "orbChat") {
        VYORACharacter.setCharacterState(state);
      }
    }
  });

  function watch() {
    document.querySelectorAll(".orb").forEach((orb) => {
      observer.observe(orb, { attributes: true, attributeFilter: ["class"] });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
