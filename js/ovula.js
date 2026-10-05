// ---------- OVULA ----------
const phaseTips = {
  menstrual:"Lower-intensity movement works well now — walking, gentle yoga, or light mobility. Rest is productive, not lazy.",
  follicular:"Energy is usually climbing — a good window to push strength training or try something new.",
  ovulatory:"Often your highest-energy phase — great for high-intensity or heavier lifting sessions if you're feeling it.",
  luteal:"Energy may dip. Moderate strength work or steady cardio tends to feel better than high-intensity pushes."
};
const phaseSelect=document.getElementById("phaseSelect"), phaseTip=document.getElementById("phaseTip");
function setPhase(){ phaseTip.textContent = phaseTips[phaseSelect.value]; }
phaseSelect.addEventListener("change",setPhase); setPhase();

const redFlags=["severe","fainting","faint","heavy bleeding","unbearable","emergency","can't stand","passed out"];
function ovulaReply(msg){
  const m=msg.toLowerCase();
  if(redFlags.some(k=>m.includes(k))) return "That sounds serious, and I'm not the right support for it — please see a doctor or gynecologist soon rather than waiting this out.";
  if(m.includes("cramp")) return "For cramps: a heating pad on the lower belly, gentle stretching, and hydration often help. If pain is ever severe or new, please check in with a doctor.";
  if(m.includes("tired")||m.includes("fatigue")||m.includes("low energy")) return "Fatigue is common in this phase — lighter movement, extra rest, and iron-rich food can help. No need to push through it.";
  if(m.includes("mood")||m.includes("irritable")||m.includes("sad")) return "Mood shifts around your cycle are normal. Gentle movement, sleep, and being kind to yourself go a long way here.";
  if(m.includes("hygiene")||m.includes("product")||m.includes("pad")||m.includes("cup")) return "Pads, tampons, and menstrual cups are all fine choices — it really comes down to comfort and routine. Happy to talk through the options.";
  return "Thanks for sharing that. I'll factor it in — and remember, for anything that feels off or unusual, a doctor is always the right call, not just me.";
}
wireChat("ovulaInput","ovulaSend","ovulaLog","orbO",ovulaReply);

const careItems=["Changed pad / cup / tampon in the last 4–6 hrs","Drank enough water today","Logged today's flow & symptoms","Did some gentle movement or stretching","Got comfortable rest"];
const ovulaChecklist=document.getElementById("ovulaChecklist");
careItems.forEach(txt=>{
  const row=document.createElement("div"); row.className="exrow";
  row.innerHTML=`<div class="exname">${txt}</div><button class="check" aria-label="Mark done"></button>`;
  row.querySelector(".check").addEventListener("click",()=>row.classList.toggle("done"));
  ovulaChecklist.appendChild(row);
});
