import fs from 'fs';
const content = fs.readFileSync('C:/Next/Santeaumaroc_old/santeaum_sam.sql', 'utf8');

function splitRows(vp) {
  const rows = []; let d=0, inStr=false, esc=false, st=0;
  for (let i=0; i<vp.length; i++) {
    const c = vp[i];
    if (esc) { esc=false; continue; }
    if (c === '\\') { esc=true; continue; }
    if (c === "'") { inStr=!inStr; continue; }
    if (inStr) continue;
    if (c === '(') { if (d++ === 0) st=i+1; }
    else if (c === ')') { if (--d === 0) rows.push(vp.slice(st, i)); }
  }
  return rows;
}
function parseValues(row) {
  const v=[]; let inStr=false, esc=false, cur='';
  for (let i=0; i<row.length; i++) {
    const c = row[i];
    if (esc) { cur+=c; esc=false; continue; }
    if (c === '\\') { esc=true; continue; }
    if (c === "'" && !inStr) { inStr=true; continue; }
    if (c === "'" && inStr) { inStr=false; continue; }
    if (inStr) { cur+=c; continue; }
    if (c === ',') { v.push(cur.trim()==='NULL'?null:cur.trim()); cur=''; continue; }
    cur += c;
  }
  v.push(cur.trim()==='NULL'?null:cur.trim());
  return v;
}

const blockRe = /INSERT INTO `etablissements`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gi;
const cats = {}; let total=0; let parsed=0; let m;
while ((m = blockRe.exec(content)) !== null) {
  const cols = m[1].split(',').map(c => c.trim().replace(/`/g,''));
  const rows = splitRows(m[2]);
  total += rows.length;
  for (const row of rows) {
    const vals = parseValues(row);
    if (vals.length !== cols.length) continue;
    const obj = {}; cols.forEach((c,i) => obj[c]=vals[i]);
    const key = `cat=${obj.id_categorie??'NULL'} statut=${obj.statut}`;
    cats[key] = (cats[key]||0)+1;
    parsed++;
  }
}
console.log(`Total rows found: ${total}, parsed: ${parsed}`);
Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(' ', v, k));
