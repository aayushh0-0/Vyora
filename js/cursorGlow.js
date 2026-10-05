/**
 * Soft light-blue cursor glow on dark VYORA background.
 * Fades with distance from the cursor (radial gradient).
 * Hidden over light UI cards / inputs for readability.
 */
(function () {
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const glow = document.createElement("div");
  glow.id = "vyoraCursorGlow";
  glow.className = "vyora-cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(glow);

  let x = -9999, y = -9999;
  let visible = true;
  let raf = 0;

  function isDarkTarget(el) {
    if (!el || el === document.documentElement || el === document.body) return true;
    // Hide glow over interactive light-ish surfaces
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return false;
    if (el.closest && el.closest("input, textarea, select, .chat-log, .msg")) return false;
    // Cards are dark in this theme too — keep glow on them
    return true;
  }

  function onMove(e) {
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    const t = e.target;
    visible = isDarkTarget(t);
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function paint() {
    raf = 0;
    if (!visible || x < 0) {
      glow.style.opacity = "0";
      return;
    }
    glow.style.opacity = "1";
    glow.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
  }

  function onLeave() {
    glow.style.opacity = "0";
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
  document.addEventListener("mouseleave", onLeave);
  window.addEventListener("blur", onLeave);
})();
