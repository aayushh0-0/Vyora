# VYORA — Next-Gen Fitness Copilot (Prototype)

AI-native fitness ecosystem with voice copilots **VYORA** (general fitness) and **OVULA** (women's health), real-time diet/workout customization, Community Hub, Offline Gym & Partner Network, and chronic-condition tracking hooks.

> This is a **client-side prototype**. All AI replies are simulated locally (no backend / LLM). Voice uses the browser SpeechRecognition + SpeechSynthesis APIs.

## Project structure

```
VYORA/
├── index.html              # Shell + all views (sections)
├── css/
│   └── styles.css          # Design system, layout, animations
├── js/
│   ├── nav.js              # Rail + mobile navigation
│   ├── voice.js            # Shared chat, TTS, mic, VYORA persona replies
│   ├── workout.js          # Weekly plan tabs + exercise checklist
│   ├── locator.js          # Gyms / cafés discovery + filters
│   ├── community.js        # Posts feed (blogs / videos)
│   ├── ovula.js            # Cycle phases, checklist, OVULA chat
│   ├── plan.js             # Onboarding → personalized diet/workout generator
│   ├── business.js         # Partner campaign builder
│   └── app.js              # Monolithic fallback (same logic in one file)
├── assets/                 # Images, Lottie, icons (empty for now)
└── README.md
```

## Views (sections)

| ID          | Feature                                      |
|-------------|----------------------------------------------|
| `home`      | VYORA copilot, onboarding plan generator     |
| `workout`   | Day-by-day exercise list                     |
| `diet`      | Macros, meals, supplements                   |
| `locator`   | Nearby gyms & cafés                          |
| `community` | Trainer/user content cards                   |
| `ovula`     | Women's health companion                     |
| `business`  | Partner campaign tools                       |

## Run locally

No build step required — static files only.

```bash
# From the VYORA folder
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` (or the port shown).  
Voice input needs HTTPS or `localhost` and a Chromium-based browser with mic permission.

## Mapping to PRD (v2)

| PRD pillar                         | Prototype status                          |
|------------------------------------|-------------------------------------------|
| VYORA AI Copilot (voice + persona) | Simulated replies + animated orb          |
| OVULA AI                           | Phase tips, checklist, safety escalations |
| Real-time diet/workout customization | Plan generator from profile inputs      |
| Community Hub                      | Static posts feed                         |
| Offline Gym & Partner Network      | Locator + campaign form                   |
| Chronic condition tracking         | Not yet in UI (data entities planned)     |
| VYORA Pro                          | Not yet in UI                             |

## Next engineering steps (from PRD)

1. Replace simulated `vyoraReply` / `ovulaReply` with LLM + guardrail layer.
2. Backend microservices (Profile, Workout, Diet, Community, Partner, Health-Tracking, Copilot Orchestration).
3. Animated character: Lottie / Rive driven by voice pipeline states.
4. Isolated encrypted store for OVULA cycle data + chronic medical data.
5. React/Next.js or React Native shell while keeping this design system.

## License / notes

Prototype for founder / build-team kickoff. Not a medical device — all health guidance is general wellness only.


## Live2D character (permanent VYORA avatar)

Center dashboard character is driven by the Live2D pipeline under `js/live2d/` and `assets/live2d/`.

**Important:** The file you provided was `model.cmo3` (Cubism **Editor project**). The browser cannot load `.cmo3`. You must export **Live2D Runtime** from Stretchy Studio:

1. Stretchy Studio → Export → **Live2D Runtime (.moc3)**
2. Unzip into `assets/live2d/vyora/`
3. Refresh the site

Source `.cmo3`, rig log, extracted `main.xml`, and layer PNGs are kept under `assets/live2d/source/` for Cubism Editor / reference.

### Character API

```js
VYORACharacter.setCharacterState("idle" | "listening" | "thinking" | "speaking" | "happy" | "concerned" | "celebrating")
VYORACharacter.setMouthAmplitude(0..1)  // from real voice only
VYORACharacter.setCursorTracking(true)
```

See `assets/live2d/README.md` for full asset layout.
