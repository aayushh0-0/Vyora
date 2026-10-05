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
