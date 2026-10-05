// ---------- VYORA chat ----------
let persona = "calm";
document.querySelectorAll("#personaRow button").forEach(b=>{
  b.addEventListener("click",()=>{
    document.querySelectorAll("#personaRow button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); persona=b.dataset.p;
    addMsg("vyoraLog","system","Personality set to "+b.textContent+".");
  });
});
const tones = {
  calm:{pre:"",post:" Take it one step at a time."},
  drill:{pre:"Alright. ",post:" No excuses today."},
  bro:{pre:"Yo. ",post:" Let's get it, bro 💪"},
  nerd:{pre:"Data check: ",post:" Numbers don't lie."}
};
function vyoraReply(msg){
  const m = msg.toLowerCase();
  let body;
  if(m.includes("tired")||m.includes("sore")) body="Your logs show 4 sessions this week — I'll drop today's volume by 20% and add extra rest between sets.";
  else if(m.includes("workout")||m.includes("exercise")) body="Today is Push Day: bench press, incline dumbbell press, and shoulder work. Check the Workout tab for the full list.";
  else if(m.includes("diet")||m.includes("eat")||m.includes("food")) body="You're at 148g of your 170g protein target — a shake or a chicken bowl would close the gap nicely.";
  else if(m.includes("water")||m.includes("hydrat")) body="You're a bit behind on water today — aim for 3 more glasses before evening.";
  else if(m.includes("motivat")||m.includes("give up")||m.includes("quit")) body="You've shown up 12 days straight — that's the hard part already done. One more session keeps the streak alive.";
  else body="Got it — I've noted that. You can always check your plan under Workout or Diet, or ask me anything else.";
  const t=tones[persona];
  return t.pre+body+t.post;
}
function addMsg(logId, cls, text){
  const log=document.getElementById(logId);
  const d=document.createElement("div"); d.className="msg "+cls; d.textContent=text;
  log.appendChild(d); log.scrollTop=log.scrollHeight;
}
function speakWithOrb(text, orb, status){
  orb.classList.remove("think"); orb.classList.add("talk"); if(status) status.textContent="Speaking…";
  const done=()=>{ orb.classList.remove("talk"); if(status) status.textContent="Ready"; };
  try{
    if("speechSynthesis" in window){
      const u=new SpeechSynthesisUtterance(text);
      u.onend=done; u.onerror=done;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } else { setTimeout(done, Math.min(4500, 1200+text.length*35)); }
  }catch(e){ setTimeout(done,1500); }
}
function wireChat(inputId, sendId, logId, orbId, replyFn){
  const input=document.getElementById(inputId), orb=document.getElementById(orbId);
  const status=document.getElementById(orbId+"Status");
  function send(){
    const val=input.value.trim(); if(!val) return;
    addMsg(logId,"user",val); input.value="";
    orb.classList.add("think"); if(status) status.textContent="Thinking…";
    setTimeout(()=>{
      const reply=replyFn(val);
      addMsg(logId,"bot",reply);
      speakWithOrb(reply, orb, status);
    },420);
  }
  document.getElementById(sendId).addEventListener("click",send);
  input.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
}
wireChat("vyoraInput","vyoraSend","vyoraLog","orb",vyoraReply);

function wireMic(btnId, inputId, orbId){
  const btn=document.getElementById(btnId), input=document.getElementById(inputId);
  const orb=document.getElementById(orbId), status=document.getElementById(orbId+"Status");
  const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ btn.addEventListener("click",()=>alert("Voice input isn't supported in this browser — please type instead.")); return; }
  const rec=new SR(); rec.lang="en-US"; rec.interimResults=false;
  let on=false;
  btn.addEventListener("click",()=>{
    if(on){ rec.stop(); return; }
    try{ rec.start(); on=true; btn.classList.add("on"); orb.classList.add("listen"); if(status) status.textContent="Listening…"; }catch(e){}
  });
  rec.onresult=(e)=>{ input.value = e.results[0][0].transcript; };
  rec.onend=()=>{ on=false; btn.classList.remove("on"); orb.classList.remove("listen"); if(status) status.textContent="Ready"; };
  rec.onerror=()=>{ on=false; btn.classList.remove("on"); orb.classList.remove("listen"); if(status) status.textContent="Ready"; };
}
wireMic("vyoraMic","vyoraInput","orb");
wireMic("ovulaMic","ovulaInput","orbO");

function triggerWave(id){
  const el=document.getElementById(id); if(!el) return;
  el.classList.add("show");
  el.addEventListener("animationend",()=>el.classList.remove("show"),{once:true});
}
setTimeout(()=>triggerWave("orbWave"),700);
let ovulaWaved=false;
document.querySelectorAll('[data-target="ovula"]').forEach(b=>b.addEventListener("click",()=>{
  if(!ovulaWaved){ ovulaWaved=true; setTimeout(()=>triggerWave("orbOWave"),400); }
}));
