const https=require("https");
const Q={
  diabete:"insulin diabetes",
  enfant:"baby doctor pediatric",
  mentale:"meditation calm wellbeing",
  prevention:"healthy food prevention",
};
function get(u){return new Promise((res,rej)=>{https.get(u,{headers:{Accept:"application/json","User-Agent":"sam/1.0"}},r=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>res(d));}).on("error",rej);});}
(async()=>{for(const [k,q] of Object.entries(Q)){
  const u=`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&page_size=15&mature=false&orientation=landscape`;
  try{const j=JSON.parse(await get(u));const rs=(j.results||[]).filter(r=>r.url).slice(0,4);
    console.log(`## ${k} (${j.result_count})`);rs.forEach((r,i)=>console.log(`${k}|${i}|${r.url}`));
  }catch(e){console.log(`## ${k} ERR`);} await new Promise(r=>setTimeout(r,500));}})();
