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
