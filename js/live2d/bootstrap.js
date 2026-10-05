(function () {
  function boot() {
    const host = document.getElementById("vyoraCharacterHost");
    if (!host || !window.VYORACharacter || !window.VYORALive2D) {
      console.error("[VYORA] character modules missing");
      return;
    }
    const { controller } = VYORACharacter;
    VYORALive2D.initLive2D(host, controller).then((result) => {
      VYORALive2D.bindPointer(controller);
      controller.setCursorTracking(true);
      controller.setCharacterState("idle");
      window.__vyoraCharacterReady = true;
      if (result && result.loaded) {
        host.classList.add("is-live");
        const orb = host.closest(".orb");
        if (orb) orb.classList.add("is-live");
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
