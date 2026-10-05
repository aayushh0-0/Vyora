// ---------- navigation ----------
const targets = ["home","workout","diet","locator","community","ovula","business"];
const railBtns = document.querySelectorAll(".navbtn");
const mobileBar = document.getElementById("mobileBar");
targets.forEach(t=>{
  const b=document.createElement("button");
  b.textContent = t==="locator"?"Gyms":t.charAt(0).toUpperCase()+t.slice(1);
  b.dataset.target=t; if(t==="home") b.classList.add("active");
  mobileBar.appendChild(b);
});
function go(target){
  targets.forEach(t=>document.getElementById(t).classList.toggle("active", t===target));
  document.querySelectorAll("[data-target]").forEach(b=>b.classList.toggle("active", b.dataset.target===target));
  document.body.dataset.section = target;
  window.scrollTo({top:0,behavior:"instant"});
}
document.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.target)));

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


// ---------- Workout ----------
const week = {
  Mon:[["Bench Press","4x8"],["Incline DB Press","3x10"],["Cable Fly","3x12"],["Overhead Press","3x8"]],
  Tue:[["Deadlift","4x6"],["Lat Pulldown","3x10"],["Barbell Row","3x10"],["Face Pull","3x15"]],
  Wed:[["Rest / Mobility","20 min"],["Stretch Flow","15 min"]],
  Thu:[["Back Squat","4x8"],["Leg Press","3x12"],["Walking Lunge","3x12"],["Calf Raise","4x15"]],
  Fri:[["Push Press","4x6"],["Dips","3xF"],["Lateral Raise","3x15"],["Tricep Pushdown","3x12"]],
  Sat:[["Pull-ups","4xF"],["Seated Row","3x10"],["Hammer Curl","3x12"],["Plank","3x45s"]],
  Sun:[["Rest","—"]]
};
const dayTabs=document.getElementById("dayTabs"), exList=document.getElementById("exList");
Object.keys(week).forEach((d,i)=>{
  const b=document.createElement("button"); b.textContent=d; if(i===0)b.classList.add("active");
  b.addEventListener("click",()=>{ document.querySelectorAll("#dayTabs button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); renderDay(d); });
  dayTabs.appendChild(b);
});
function renderDay(d){
  exList.innerHTML="";
  week[d].forEach(([name,meta])=>{
    const row=document.createElement("div"); row.className="exrow";
    row.innerHTML=`<div><div class="exname">${name}</div><div class="exmeta">${meta}</div></div><button class="check" aria-label="Mark done"></button>`;
    row.querySelector(".check").addEventListener("click",()=>row.classList.toggle("done"));
    exList.appendChild(row);
  });
}
renderDay("Mon");

// ---------- Locator ----------
const places=[
  {name:"Iron Loft Gym",type:"gym",tags:["24/7","Free weights","Trainer on-site"],dist:"0.8 km"},
  {name:"Pulse Fitness Studio",type:"gym",tags:["HIIT classes","AC","Locker"],dist:"1.2 km"},
  {name:"Greens & Grains Café",type:"cafe",tags:["High-protein","Vegan options"],dist:"0.5 km"},
  {name:"The Protein Bar",type:"cafe",tags:["Smoothies","Low-carb menu"],dist:"1.6 km"}
];
const placeList=document.getElementById("placeList");
places.forEach(p=>{
  const c=document.createElement("div"); c.className="card place-card show"; c.dataset.type=p.type;
  c.innerHTML=`<h3>${p.name}</h3><p style="margin:0 0 8px;">${p.dist} away</p>${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}`;
  placeList.appendChild(c);
});
document.querySelectorAll("#placeFilter button").forEach(b=>{
  b.addEventListener("click",()=>{
    document.querySelectorAll("#placeFilter button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    document.querySelectorAll(".place-card").forEach(c=>{
      c.classList.toggle("show", b.dataset.f==="all"||c.dataset.type===b.dataset.f);
    });
  });
});

// ---------- Community ----------
const posts=[
  {type:"Article",title:"5 signs your program needs a deload",author:"Coach Riya",meta:"6 min read · 214 likes"},
  {type:"Video",title:"Form check: hip hinge for beginners",author:"Coach Arjun",meta:"4:12 · 412 views"},
  {type:"Blog",title:"What I eat in a cutting phase",author:"Meera K.",meta:"3 min read · 98 likes"},
  {type:"Article",title:"Training around a busy work week",author:"Coach Dev",meta:"5 min read · 156 likes"}
];
const postList=document.getElementById("postList");
posts.forEach(p=>{
  const c=document.createElement("div"); c.className="card post-card";
  c.innerHTML=`<span class="post-badge">${p.type}</span><h3>${p.title}</h3><p style="margin:0;">by ${p.author}</p><p class="post-meta">${p.meta}</p>`;
  postList.appendChild(c);
});

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

// ---------- Personalized plan generator ----------
const dietMealSets={
  veg:["Oats, milk, peanut butter, banana","Paneer/dal bowl, brown rice, salad","Sprout &amp; veg stir-fry, roti","Curd, nuts, fruit"],
  nonveg:["Egg whites, oats, banana","Grilled chicken, rice, sautéed greens","Fish or chicken curry, quinoa","Greek yogurt, almonds"],
  vegan:["Tofu scramble, whole-grain toast","Chickpea bowl, brown rice, greens","Lentil &amp; veg curry, millet roti","Soy milk smoothie, nuts"],
  keto:["Eggs, avocado, cheese","Grilled chicken/paneer, leafy greens, olive oil","Salmon or tofu, sautéed vegetables","Nuts, seeds, Greek yogurt (full-fat)"]
};
const goalCopy={
  fatloss:{cal:d=>Math.round(d-450),split:["Full Body Strength","Cardio + Core","Full Body Strength","Active Recovery","Full Body Strength","HIIT","Rest"],sum:"A moderate calorie deficit with strength training to preserve muscle while you lean out."},
  musclegain:{cal:d=>Math.round(d+350),split:["Push (Chest/Shoulders/Triceps)","Pull (Back/Biceps)","Legs","Rest","Push","Pull","Legs"],sum:"A calorie surplus with a push/pull/legs split to drive steady muscle growth."},
  recomp:{cal:d=>Math.round(d),split:["Upper Strength","Lower Strength","Cardio + Core","Upper Hypertrophy","Lower Hypertrophy","Active Recovery","Rest"],sum:"Calories near maintenance with a strength-first split to build muscle while trimming fat."},
  endurance:{cal:d=>Math.round(d+150),split:["Zone 2 Cardio","Strength (Full Body)","Intervals","Rest","Zone 2 Cardio","Long Session","Rest"],sum:"Extra fuel with a mix of steady-state and interval training to build stamina."}
};
const videoBank={
  fatloss:[["Beginner Fat-Loss Workout (No Equipment)","fat loss workout no equipment"],["HIIT Cardio for Beginners","beginner HIIT cardio"],["How to Read Food Labels","how to read nutrition labels"]],
  musclegain:[["Perfect Push-Pull-Legs Split","push pull legs split for beginners"],["Bench Press Form Tutorial","bench press proper form"],["High Protein Meal Prep","high protein meal prep for muscle gain"]],
  recomp:[["Beginner Full Body Strength Routine","beginner full body strength workout"],["Body Recomposition Explained","body recomposition explained"],["Simple Meal Prep for Recomp","simple healthy meal prep"]],
  endurance:[["Zone 2 Cardio Explained","zone 2 cardio training explained"],["Beginner Interval Running Guide","beginner interval running workout"],["Fueling for Endurance Training","nutrition for endurance athletes"]]
};
const suppBank={
  fatloss:["Whey/plant protein","Multivitamin","Omega-3"],
  musclegain:["Whey protein","Creatine monohydrate","Multivitamin"],
  recomp:["Whey/plant protein","Creatine monohydrate","Omega-3"],
  endurance:["Electrolyte mix","Multivitamin","Omega-3"]
};
document.getElementById("pGenerate").addEventListener("click",()=>{
  const h=parseFloat(document.getElementById("pHeight").value);
  const w=parseFloat(document.getElementById("pWeight").value);
  const gender=document.getElementById("pGender").value;
  const diet=document.getElementById("pDiet").value;
  const goal=document.getElementById("pGoal").value;
  if(!h||!w){ alert("Please add your height and weight first."); return; }
  const heightM=h/100;
  const bmr = gender==="female" ? (10*w+6.25*h-5*25-161) : (10*w+6.25*h-5*25+5);
  const maintenance = Math.round(bmr*1.4);
  const g = goalCopy[goal];
  const target = g.cal(maintenance);

  document.getElementById("rDietSummary").textContent = `${g.sum} Target: about ${target} kcal/day, on a ${diet==="nonveg"?"non-vegetarian":diet} plan.`;
  document.getElementById("rMeals").innerHTML = dietMealSets[diet].map((m,i)=>`<div class="meal" style="${i===dietMealSets[diet].length-1?'border:none;':''}"><b>${["Breakfast","Lunch","Dinner","Snack"][i]}</b><p style="margin:2px 0;">${m}</p></div>`).join("");

  document.getElementById("rWorkoutSummary").textContent = g.sum;
  document.getElementById("rWorkoutDays").innerHTML = g.split.map((d,i)=>`<div class="exrow" style="${i===g.split.length-1?'border:none;':''}"><div class="exname">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</div><div class="exmeta">${d}</div></div>`).join("");

  document.getElementById("rSupps").innerHTML = suppBank[goal].map(s=>`<span class="tag">${s}</span>`).join("")+`<div style="margin-top:10px;"><a class="btn ghost" href="#" onclick="return false;">View on marketplace ↗</a></div>`;

  document.getElementById("rVideos").innerHTML = videoBank[goal].map(([title,q])=>`<div class="vid-card">${title}<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" rel="noopener">Watch demo ↗</a></div>`).join("");

  const gymBox=document.getElementById("rGyms");
  function renderGyms(locLabel){
    gymBox.innerHTML = places.filter(p=>p.type==="gym").map(p=>`<div class="gym-item"><b>${p.name}</b><span>${p.dist} from ${locLabel} · ${p.tags.join(", ")}</span></div>`).join("");
  }
  const locStatus=document.getElementById("pLocStatus");
  if("geolocation" in navigator){
    locStatus.textContent="Finding gyms near your location…";
    navigator.geolocation.getCurrentPosition(
      ()=>{ locStatus.textContent="Showing gyms near your current location."; renderGyms("you"); },
      ()=>{ locStatus.textContent="Location not shared — showing nearby sample gyms instead."; renderGyms("city center"); },
      {timeout:4000}
    );
  } else { renderGyms("city center"); }

  document.getElementById("planResults").style.display="block";
  document.getElementById("planResults").scrollIntoView({behavior:"smooth",block:"start"});
});

// ---------- Business ----------
const campList=document.getElementById("campList");
let campaigns=[];
document.getElementById("cAdd").addEventListener("click",()=>{
  const n=document.getElementById("cName").value.trim();
  const o=document.getElementById("cOffer").value.trim();
  const d=document.getElementById("cDate").value;
  if(!n||!o){ alert("Add a business name and an offer first."); return; }
  campaigns.push({n,o,d});
  campList.innerHTML = campaigns.map(c=>`<div class="camp-item"><b>${c.n}</b><span>${c.o}${c.d? " · until "+c.d:""}</span></div>`).join("");
  document.getElementById("cName").value=""; document.getElementById("cOffer").value=""; document.getElementById("cDate").value="";
});


