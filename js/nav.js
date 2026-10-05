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
