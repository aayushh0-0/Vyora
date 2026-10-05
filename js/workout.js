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
