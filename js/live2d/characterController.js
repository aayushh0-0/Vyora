/**
 * VYORA Character Controller
 * States, cursor tracking (with attention cone), idle micro-anims, lip-sync hooks.
 */
(function (global) {
  const STATES = Object.freeze({
    IDLE: "idle",
    LISTENING: "listening",
    THINKING: "thinking",
    SPEAKING: "speaking",
    HAPPY: "happy",
    CONCERNED: "concerned",
    CELEBRATING: "celebrating",
  });

  const PARAM = {
    ANGLE_X: "ParamAngleX",
    ANGLE_Y: "ParamAngleY",
    ANGLE_Z: "ParamAngleZ",
    BODY_X: "ParamBodyAngleX",
    BODY_Y: "ParamBodyAngleY",
    BODY_Z: "ParamBodyAngleZ",
    EYE_BALL_X: "ParamEyeBallX",
    EYE_BALL_Y: "ParamEyeBallY",
    EYE_L_OPEN: "ParamEyeLOpen",
    EYE_R_OPEN: "ParamEyeROpen",
    MOUTH_OPEN: "ParamMouthOpenY",
    MOUTH_FORM: "ParamMouthForm",
    BROW_L: "ParamBrowLY",
    BROW_R: "ParamBrowRY",
    BREATH: "ParamBreath",
  };

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class CharacterController {
    constructor() {
      this.state = STATES.IDLE;
      this.cursorTracking = true;
      this._listeners = new Set();
      this._driver = null;

      this._t = {
        angleX: 0, angleY: 0, angleZ: 0,
        bodyX: 0, bodyY: 0,
        eyeX: 0, eyeY: 0,
        mouthOpen: 0, mouthForm: 0,
        brow: 0, breath: 0,
      };
      this._v = { ...this._t };

      this._blinkT = 2.5 + Math.random() * 2; // countdown to next blink
      this._blinkPhase = "idle"; // idle | closing | opening
      this._blinkProg = 0; // 0..1 within closing/opening
      this._breathT = 0;
      this._speakingAmp = 0;
      this._raf = 0;
      this._mx = 0.5;
      this._my = 0.5;
      this._lastTs = 0;
      this._boundLoop = (ts) => this._loop(ts);

      // Attention cone: 1 near orb, lower far away
      this._attention = 1;
      // Idle glance
      this._glanceT = 4 + Math.random() * 4;
      this._glanceX = 0;
      this._glanceY = 0;
      this._orbRect = null;
    }

    attachDriver(driver) {
      this._driver = driver;
      if (!this._raf) this._raf = requestAnimationFrame(this._boundLoop);
      this._emit();
    }

    detachDriver() {
      this._driver = null;
    }

    setCharacterState(state) {
      const s = String(state || "").toLowerCase();
      if (!Object.values(STATES).includes(s)) {
        console.warn("[VYORA Character] unknown state:", state);
        return;
      }
      this.state = s;
      this._applyStatePose();
      this._emit();
      document.body.dataset.charState = s;
    }

    setCursorTracking(on) {
      this.cursorTracking = !!on;
    }

    setPointerNormalized(nx, ny) {
      this._mx = Math.max(0, Math.min(1, nx));
      this._my = Math.max(0, Math.min(1, ny));
    }

    /** Update attention from pixel distance to hero orb (0..1) */
    setAttentionFromPoint(clientX, clientY) {
      const orb = document.getElementById("orb");
      if (!orb) {
        this._attention = 1;
        return;
      }
      const r = orb.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Full attention within ~1.2 orb radii, fall off to 0.25 by ~screen third
      const radius = Math.max(r.width, 120) * 1.2;
      const fall = Math.min(1, dist / (radius * 5));
      this._attention = 1 - fall * 0.45; // 1.0 → ~0.55 (still strong far away)
    }

    setMouthAmplitude(amp) {
      this._speakingAmp = Math.max(0, Math.min(1, amp || 0));
    }

    onChange(fn) {
      this._listeners.add(fn);
      return () => this._listeners.delete(fn);
    }

    _emit() {
      for (const fn of this._listeners) {
        try { fn(this.state); } catch (e) { console.error(e); }
      }
    }

    _applyStatePose() {
      switch (this.state) {
        case STATES.LISTENING:
          this._t.brow = 0.25;
          this._t.mouthForm = 0.1;
          break;
        case STATES.THINKING:
          this._t.brow = -0.2;
          this._t.mouthForm = -0.15;
          break;
        case STATES.SPEAKING:
          this._t.mouthForm = 0.2;
          break;
        case STATES.HAPPY:
          this._t.brow = 0.35;
          this._t.mouthForm = 0.45;
          break;
        case STATES.CONCERNED:
          this._t.brow = -0.45;
          this._t.mouthForm = -0.25;
          break;
        case STATES.CELEBRATING:
          this._t.brow = 0.4;
          this._t.mouthForm = 0.5;
          this._t.angleZ = 0.08;
          break;
        default:
          this._t.brow = 0;
          this._t.mouthForm = 0;
          this._t.angleZ = 0;
          break;
      }
    }

    _loop(ts) {
      this._raf = requestAnimationFrame(this._boundLoop);
      if (reducedMotion()) {
        this._pushParams(1);
        return;
      }
      const dt = this._lastTs ? Math.min(0.05, (ts - this._lastTs) / 1000) : 0.016;
      this._lastTs = ts;

      const att = this._attention;

      if (this.cursorTracking) {
        const dx = (this._mx - 0.5) * 2;
        const dy = (this._my - 0.5) * 2;
        // Eyes track cursor strongly; attention softens only when far away
        // att is ~0.35..1 — keep a high floor so tracking always feels responsive
        const eyeAtt = 0.55 + att * 0.45;
        this._t.eyeX = clamp(dx * 1.0 * eyeAtt, -1, 1);
        this._t.eyeY = clamp(-dy * 0.75 * eyeAtt, -1, 1);
        this._t.angleX = clamp(dx * 22 * eyeAtt, -30, 30);
        this._t.angleY = clamp(-dy * 14 * eyeAtt, -20, 20);
        this._t.bodyX = clamp(dx * 7 * eyeAtt, -10, 10);
        this._t.bodyY = clamp(-dy * 4 * eyeAtt, -6, 6);
      } else {
        this._t.eyeX = 0;
        this._t.eyeY = 0;
        this._t.angleX *= 0.9;
        this._t.angleY *= 0.9;
        this._t.bodyX *= 0.9;
        this._t.bodyY *= 0.9;
      }

      // Idle glance — occasional look away when idle and low attention
      this._glanceT -= dt;
      if (this._glanceT <= 0 && this.state === STATES.IDLE && att < 0.55) {
        this._glanceX = (Math.random() - 0.5) * 0.35;
        this._glanceY = (Math.random() - 0.5) * 0.2;
        this._glanceT = 5 + Math.random() * 6;
        setTimeout(() => {
          this._glanceX = 0;
          this._glanceY = 0;
        }, 600 + Math.random() * 400);
      }
      if (this.state === STATES.IDLE && att < 0.55) {
        this._t.eyeX += this._glanceX;
        this._t.eyeY += this._glanceY;
        this._t.eyeX = clamp(this._t.eyeX, -1, 1);
        this._t.eyeY = clamp(this._t.eyeY, -1, 1);
      }

      // Breath
      this._breathT += dt;
      this._t.breath = 0.5 + 0.5 * Math.sin(this._breathT * 1.4);

      // Human blink state machine: idle → closing (~90ms) → opening (~110ms) → idle
      // Interval between blinks ~2.8–5.5s (mean ~4s); ~15% double-blink
      let eyeOpen = 1;
      if (this._blinkPhase === "closing") {
        this._blinkProg += dt / 0.09;
        if (this._blinkProg >= 1) {
          this._blinkProg = 0;
          this._blinkPhase = "opening";
          eyeOpen = 0;
        } else {
          eyeOpen = 1 - this._blinkProg;
        }
      } else if (this._blinkPhase === "opening") {
        this._blinkProg += dt / 0.11;
        if (this._blinkProg >= 1) {
          eyeOpen = 1;
          this._blinkPhase = "idle";
          this._blinkT = (Math.random() < 0.15) ? 0.18 : (2.8 + Math.random() * 2.7);
        } else {
          eyeOpen = this._blinkProg;
        }
      } else {
        // idle — wait for next blink
        this._blinkT -= dt;
        if (this._blinkT <= 0) {
          this._blinkPhase = "closing";
          this._blinkProg = 0;
        }
        eyeOpen = 1;
      }

      // Lip-sync amplitude
      if (this.state === STATES.SPEAKING) {
        this._t.mouthOpen = this._speakingAmp;
      } else {
        this._t.mouthOpen *= 0.85;
      }

      // Coach mode lean when on workout
      if (document.body.dataset.section === "workout" && this.state === STATES.IDLE) {
        this._t.angleY = Math.max(this._t.angleY, 4);
        this._t.bodyY = Math.min(this._t.bodyY, -1);
      }

      const k = 1 - Math.pow(0.001, dt);
      for (const key of Object.keys(this._t)) {
        this._v[key] += (this._t[key] - this._v[key]) * Math.min(1, k * 8);
      }

      this._pushParams(eyeOpen);
    }

    _pushParams(eyeOpen) {
      const d = this._driver;
      if (!d || !d.isReady || !d.isReady()) return;
      set(d, PARAM.EYE_BALL_X, this._v.eyeX);
      set(d, PARAM.EYE_BALL_Y, this._v.eyeY);
      set(d, PARAM.ANGLE_X, this._v.angleX);
      set(d, PARAM.ANGLE_Y, this._v.angleY);
      set(d, PARAM.ANGLE_Z, this._v.angleZ);
      set(d, PARAM.BODY_X, this._v.bodyX);
      set(d, PARAM.BODY_Y, this._v.bodyY);
      set(d, PARAM.EYE_L_OPEN, eyeOpen);
      set(d, PARAM.EYE_R_OPEN, eyeOpen);
      set(d, PARAM.MOUTH_OPEN, this._v.mouthOpen);
      set(d, PARAM.MOUTH_FORM, this._v.mouthForm);
      set(d, PARAM.BROW_L, this._v.brow);
      set(d, PARAM.BROW_R, this._v.brow);
      set(d, PARAM.BREATH, this._v.breath);
    }

    destroy() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      this._driver = null;
      this._listeners.clear();
    }
  }

  function set(driver, id, value) {
    if (driver.hasParam && !driver.hasParam(id)) return;
    driver.setParam(id, value);
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  const controller = new CharacterController();
  global.VYORACharacter = {
    controller,
    STATES,
    PARAM,
    setCharacterState: (s) => controller.setCharacterState(s),
    setMouthAmplitude: (a) => controller.setMouthAmplitude(a),
    setCursorTracking: (on) => controller.setCursorTracking(on),
  };
})(window);
