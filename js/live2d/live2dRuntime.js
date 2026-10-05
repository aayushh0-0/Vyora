/**
 * VYORA character runtime
 * Body art + iris layers (cursor track) + eyelid overlays (blink).
 */
(function (global) {
  const MODEL_DIR = "assets/live2d/vyora/";
  const CANVAS = 1280;
  // Iris travel in model-canvas pixels (kept inside eye white)
  const MAX_CANVAS_X = 6.5;
  const MAX_CANVAS_Y = 3.5;

  // Eye centers / sizes in 1280 model space (from rig)
  const EYES = {
    r: { cx: 567.5, cy: 423, w: 56, h: 36 }, // character right = viewer left
    l: { cx: 672, cy: 383.5, w: 62, h: 42 },
  };

  class ImageDriver {
    constructor(stage, body, irisR, irisL, lidR, lidL) {
      this.stage = stage;
      this.body = body;
      this.irisR = irisR;
      this.irisL = irisL;
      this.lidR = lidR;
      this.lidL = lidL;
      this.ready = true;
      this._params = Object.create(null);
    }
    isReady() { return true; }
    hasParam() { return true; }
    setParam(id, value) {
      this._params[id] = value;
      this._apply();
    }
    _scale() {
      if (!this.stage) return 0.35;
      const w = this.stage.getBoundingClientRect().width;
      return w > 10 ? w / CANVAS : 0.35;
    }
    _apply() {
      const p = this._params;
      const eyeX = clamp(p.ParamEyeBallX || 0, -1, 1);
      const eyeY = clamp(p.ParamEyeBallY || 0, -1, 1);
      const angX = (p.ParamAngleX || 0) / 30;
      const angY = (p.ParamAngleY || 0) / 20;
      const bodyX = (p.ParamBodyAngleX || 0) / 10;
      const bodyY = (p.ParamBodyAngleY || 0) / 6;
      const breath = p.ParamBreath != null ? p.ParamBreath : 0.5;

      // Soft body/head parallax
      const tx = angX * 6 + bodyX * 2;
      const ty = angY * 4 + bodyY * 1.5 + (breath - 0.5) * 2.5;
      const rot = angX * 1.6 + bodyX * 0.8;
      const sc = 1 + (breath - 0.5) * 0.012;
      if (this.stage) {
        this.stage.style.transform =
          "translate(calc(-50% + " + tx.toFixed(2) + "px), calc(-50% + " + ty.toFixed(2) +
          "px)) rotate(" + rot.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
      }

      // Blink openness 1=open 0=closed
      const openL = p.ParamEyeLOpen != null ? p.ParamEyeLOpen : 1;
      const openR = p.ParamEyeROpen != null ? p.ParamEyeROpen : 1;

      // Iris tracking
      const s = this._scale();
      const ox = eyeX * MAX_CANVAS_X * s;
      const oy = -eyeY * MAX_CANVAS_Y * s;

      this._setIris(this.irisR, ox, oy, openR);
      this._setIris(this.irisL, ox, oy, openL);
      this._setLid(this.lidR, openR);
      this._setLid(this.lidL, openL);
    }
    _setIris(el, ox, oy, open) {
      if (!el) return;
      // Keep pupil position stable — no scaleY (that made pupils drop).
      // Only fade under the lid as the eye closes.
      const op = open * open; // ease out faster so lid covers before iris vanishes
      el.style.transform =
        "translate(" + ox.toFixed(2) + "px, " + oy.toFixed(2) + "px)";
      el.style.opacity = String(Math.max(0, Math.min(1, op)));
    }
    _setLid(el, open) {
      if (!el) return;
      // Lid covers eye as open → 0: scaleY 0 (open) → 1 (closed)
      const cover = 1 - open; // 0 open, 1 closed
      el.style.transform = "scaleY(" + cover.toFixed(3) + ")";
      el.style.opacity = cover > 0.02 ? "1" : "0";
    }
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function makeLid(id, eye) {
    const el = document.createElement("div");
    el.id = id;
    el.className = "vyora-lid";
    el.setAttribute("aria-hidden", "true");
    // Position as % of 1280 canvas stage
    const left = ((eye.cx - eye.w / 2) / CANVAS) * 100;
    const top = ((eye.cy - eye.h / 2) / CANVAS) * 100;
    const width = (eye.w / CANVAS) * 100;
    const height = (eye.h / CANVAS) * 100;
    el.style.left = left + "%";
    el.style.top = top + "%";
    el.style.width = width + "%";
    el.style.height = height + "%";
    return el;
  }

  async function initLive2D(container, controller) {
    const stage =
      container.querySelector("#vyoraCharStage") ||
      container.querySelector(".vyora-char-stage");
    let body = container.querySelector("#vyoraCharacterImg");
    let irisR = container.querySelector("#vyoraIrisR");
    let irisL = container.querySelector("#vyoraIrisL");

    if (!stage) {
      console.error("[VYORA] char stage missing");
      return { loaded: false };
    }

    if (!body) {
      body = document.createElement("img");
      body.id = "vyoraCharacterImg";
      body.className = "vyora-character-img";
      body.alt = "VYORA";
      stage.appendChild(body);
    }
    if (!irisR) {
      irisR = document.createElement("img");
      irisR.id = "vyoraIrisR";
      irisR.className = "vyora-iris vyora-iris-r";
      irisR.alt = "";
      stage.appendChild(irisR);
    }
    if (!irisL) {
      irisL = document.createElement("img");
      irisL.id = "vyoraIrisL";
      irisL.className = "vyora-iris vyora-iris-l";
      irisL.alt = "";
      stage.appendChild(irisL);
    }

    // Eyelid overlays
    let lidR = stage.querySelector("#vyoraLidR");
    let lidL = stage.querySelector("#vyoraLidL");
    if (!lidR) {
      lidR = makeLid("vyoraLidR", EYES.r);
      stage.appendChild(lidR);
    }
    if (!lidL) {
      lidL = makeLid("vyoraLidL", EYES.l);
      stage.appendChild(lidL);
    }

    body.src = MODEL_DIR + "character_body.png";
    irisR.src = MODEL_DIR + "iris_r.png";
    irisL.src = MODEL_DIR + "iris_l.png";
    body.draggable = false;
    irisR.draggable = false;
    irisL.draggable = false;

    const driver = new ImageDriver(stage, body, irisR, irisL, lidR, lidL);
    controller.attachDriver(driver);
    controller.setCursorTracking(true);

    await new Promise((resolve) => {
      let left = 3;
      const done = () => {
        if (--left <= 0) resolve();
      };
      [body, irisR, irisL].forEach((img) => {
        if (img.complete && img.naturalWidth > 0) done();
        else {
          img.onload = done;
          img.onerror = () => {
            console.warn("[VYORA] failed to load", img.src);
            done();
          };
        }
      });
    });

    container.classList.add("is-live");
    const orb = container.closest(".orb");
    if (orb) orb.classList.add("is-live");

    console.info("[VYORA] character ready — eye tracking + blink active");
    return { driver, loaded: true };
  }

  function bindPointer(controller) {
    if (!controller) return;
    function update(e) {
      let x, y;
      if (e.touches && e.touches.length) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      if (x == null) return;
      controller.setPointerNormalized(
        x / Math.max(1, window.innerWidth),
        y / Math.max(1, window.innerHeight)
      );
    }
    window.addEventListener("pointermove", update, { passive: true });
    window.addEventListener("mousemove", update, { passive: true });
    window.addEventListener("touchmove", update, { passive: true });
  }

  global.VYORALive2D = { initLive2D, bindPointer, MODEL_DIR };
})(window);
