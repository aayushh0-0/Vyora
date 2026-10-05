VYORA — Fitness Copilot (prototype)
====================================

HOW TO RUN
1. Unzip this folder.
2. Open index.html directly in a browser (double-click it), OR
   open the folder in VS Code and use the "Live Server" extension
   for auto-reload while editing (recommended, since mic/voice
   features work most reliably over localhost).

WHAT'S INSIDE
- index.html — the entire app (HTML + CSS + JS in one file, no
  build step, no dependencies to install).

NOTES
- This is a front-end prototype. Voice input uses the browser's
  built-in Speech Recognition API (works in Chrome/Edge; not all
  browsers support it). Voice replies use the browser's built-in
  Speech Synthesis API.
- All AI replies, gym listings, videos, and supplement suggestions
  are simulated/mocked client-side for demo purposes — nothing here
  calls a real backend, database, or AI model yet.
- Nothing persists after a page reload (no login, no saved data).
