// ---------- VYORA chat ----------
let persona = "calm";
document.querySelectorAll("#personaRow button").forEach(b=>{
  b.addEventListener("click",()=>{
    document.querySelectorAll("#personaRow button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); persona=b.dataset.p;
    addMsg("vyoraLog","system","Personality set to "+b.textContent+".");
    if (window.VYORASfx) VYORASfx.tick();
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
  else if(m.includes("form")||m.includes("camera")||m.includes("watch me")||m.includes("check my")) body="I'm watching — set your phone to the side, full body in frame. Hit record for one clean set and I'll give form notes next.";
  else if(m.includes("workout")||m.includes("exercise")) body="Today is Push Day: bench press, incline dumbbell press, and shoulder work. Check the Workout tab for the full list.";
  else if(m.includes("diet")||m.includes("eat")||m.includes("food")) body="You're at 148g of your 170g protein target — a shake or a chicken bowl would close the gap nicely.";
  else if(m.includes("water")||m.includes("hydrat")) body="You're a bit behind on water today — aim for 3 more glasses before evening.";
  else if(m.includes("motivat")||m.includes("give up")||m.includes("quit")) body="You've shown up 12 days straight — that's the hard part already done. One more session keeps the streak alive.";
  else if(m.includes("pr")||m.includes("personal record")||m.includes("crushed")) body="That's a PR energy — own it. Log the set so we can build on it next week.";
  else body="Got it — I've noted that. You can always check your plan under Workout or Diet, or ask me anything else.";
  const t=tones[persona];
  return t.pre+body+t.post;
}
function addMsg(logId, cls, text){
  const log=document.getElementById(logId);
  if(!log) return;
  const d=document.createElement("div"); d.className="msg "+cls; d.textContent=text;
  log.appendChild(d); log.scrollTop=log.scrollHeight;
}
function speakWithOrb(text, orb, status){
  if(!orb) return;
  orb.classList.remove("think","listen"); orb.classList.add("talk");
  if(status) status.textContent="Speaking…";

  const hero = document.getElementById("orb");
  if (hero) hero.classList.add("talk");

  if (window.VYORACharacter) VYORACharacter.setCharacterState("speaking");

  const dur = Math.min(5000, Math.max(1600, (text || "").length * 45));
  if (window.VYORALipSync) VYORALipSync.start(dur);

  let usedTTS = false;
  if ("speechSynthesis" in window && text) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02; u.pitch = 1.05;
      u.onend = finish; u.onerror = finish;
      window.speechSynthesis.speak(u);
      usedTTS = true;
    } catch (e) {}
  }
  if (!usedTTS) setTimeout(finish, dur);

  function finish(){
    if (window.VYORALipSync) VYORALipSync.stop();
    orb.classList.remove("talk");
    if (hero) hero.classList.remove("talk");
    if(status) status.textContent="Ready";
    if (window.VYORACharacter) {
      VYORACharacter.setMouthAmplitude(0);
      const settle = (window.VYORAEmotion && VYORAEmotion.fromText(text, "bot")) || "happy";
      VYORACharacter.setCharacterState(settle === "listening" ? "happy" : settle);
      setTimeout(() => {
        if (VYORACharacter.controller.state !== "speaking") {
          VYORACharacter.setCharacterState("idle");
        }
      }, 1600);
    }
  }
}
function wireChat(inputId, sendId, logId, orbId, replyFn){
  const input=document.getElementById(inputId);
  const orb=document.getElementById(orbId);
  const statusMap={orb:"orbStatus",orbChat:"orbChatStatus",orbO:"orbOStatus"};
  const status=document.getElementById(statusMap[orbId]||"orbStatus");
  function send(){
    const msg=(input && input.value||"").trim();
    if(!msg) return;
    if(input) input.value="";
    addMsg(logId,"user",msg);
    if (window.VYORASfx) VYORASfx.tick();
    if (window.VYORAFormCheck) VYORAFormCheck(msg);
    if (window.VYORAEmotion) {
      const em = VYORAEmotion.fromText(msg, "user");
      VYORAEmotion.set(em, 0);
    }
    if(orb) orb.classList.add("think");
    if(status) status.textContent="Thinking…";
    if (window.VYORACharacter) VYORACharacter.setCharacterState("thinking");
    setTimeout(()=>{
      const reply=replyFn(msg);
      addMsg(logId,"bot",reply);
      speakWithOrb(reply, orb, status);
    }, 700 + Math.random()*500);
  }
  const sendBtn=document.getElementById(sendId);
  if(sendBtn) sendBtn.addEventListener("click",send);
  if(input) input.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
}
function wireMic(btnId, inputId, orbId){
  const btn=document.getElementById(btnId);
  const input=document.getElementById(inputId);
  const orb=document.getElementById(orbId);
  const statusMap={orb:"orbStatus",orbChat:"orbChatStatus",orbO:"orbOStatus"};
  const status=document.getElementById(statusMap[orbId]||"orbStatus");
  if(!btn) return;
  if(!window.SpeechRecognition && !window.webkitSpeechRecognition){
    btn.title="Voice not supported — type instead"; btn.disabled=true; return;
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const rec=new SR(); rec.lang="en-IN"; rec.interimResults=false;
  let on=false;
  btn.addEventListener("click",()=>{
    if(on){ try{rec.stop();}catch(e){} return; }
    try{
      rec.start(); on=true; btn.classList.add("on");
      if(orb) orb.classList.add("listen");
      if(status) status.textContent="Listening…";
      if (window.VYORACharacter) VYORACharacter.setCharacterState("listening");
      if (window.VYORASfx) VYORASfx.soft();
    }catch(e){}
  });
  rec.onresult=(e)=>{ const t=e.results[0][0].transcript; if(input) input.value=t; };
  rec.onend=()=>{
    on=false; btn.classList.remove("on");
    if(orb) orb.classList.remove("listen");
    if(status) status.textContent="Ready";
    if (window.VYORACharacter && VYORACharacter.controller.state==="listening")
      VYORACharacter.setCharacterState("idle");
  };
  rec.onerror=()=>{
    on=false; btn.classList.remove("on");
    if(orb) orb.classList.remove("listen");
    if(status) status.textContent="Ready";
  };
}
function triggerWave(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.classList.add("show");
  el.addEventListener("animationend",()=>el.classList.remove("show"),{once:true});
}

wireChat("vyoraInput","vyoraSend","vyoraLog","orbChat", vyoraReply);
wireMic("vyoraMic","vyoraInput","orbChat");

wireMic("ovulaMic","ovulaInput","orbO");
