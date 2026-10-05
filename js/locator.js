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
