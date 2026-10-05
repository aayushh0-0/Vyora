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
