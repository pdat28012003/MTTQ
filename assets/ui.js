/* =====================================================================
   ui.js — tiện ích giao diện: icon, badge, toast, modal, drawer, biểu đồ SVG
   ===================================================================== */

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function $id(x){ return document.getElementById(x); }
function round1(n){ return Math.round(n*10)/10; }
function fmt1(n){ return (Math.round(n*10)/10).toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1}); }

/* ---------- icon set (stroke, đồng bộ) ---------- */
const ICONS = {
  home:  '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  doc:   '<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v4h4"/><path d="M9 12h7M9 16h7M9 8h2"/>',
  map:   '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  org:   '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M12 12H6v4M12 12h6v4"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.4 15.2c2.6.3 4.4 1.7 5.1 4.3"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V7M16 16v-3M20 16V9"/>',
  shield:'<path d="M12 2 4.5 5v6c0 5 3.2 8.7 7.5 10.5C16.3 19.7 19.5 16 19.5 11V5z"/><path d="m9 11.5 2.2 2.3L15.5 9"/>',
  bell:  '<path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  warn:  '<path d="M12 3 2.5 20h19z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  info:  '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".7" fill="currentColor"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  plus:  '<path d="M12 5v14M5 12h14"/>',
  x:     '<path d="m6 6 12 12M18 6 6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>',
  down:  '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  upload:'<path d="M12 16V4m0 0 4 4m-4-4-4 4"/><path d="M4 17v3h16v-3"/>',
  export:'<path d="M12 4v12m0 0 4-4m-4 4-4-4"/><path d="M4 20h16"/>',
  file:  '<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v4h4"/>',
  img:   '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m5 19 5.5-5.5 3 3L17 13l3 3.5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  send:  '<path d="M21.5 2.5 10 14"/><path d="M21.5 2.5 14.5 21l-4.5-7-7-4.5z"/>',
  star:  '<path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/>',
  medal: '<circle cx="12" cy="14" r="5.5"/><path d="m8.5 9.5-3-6.5H10l2 4 2-4h4.5l-3 6.5"/>',
  edit:  '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  back:  '<path d="m14 6-6 6 6 6"/>',
  eye:   '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  lock:  '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  sum:   '<path d="M18 4H6l6 8-6 8h12"/>',
  rank:  '<path d="M4 20h16"/><rect x="9.5" y="6" width="5" height="14"/><rect x="3" y="11" width="5" height="9"/><rect x="16" y="9" width="5" height="11"/>',
  group: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  prog:  '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="currentColor" stroke="none" opacity=".35"/><path d="M12 7v5l3.5 2"/>',
  cmp:   '<path d="M4 20h16M7 20V9M12 20V4M17 20v-8"/>',
  user:  '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
  dept:  '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/>',
  custom:'<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2"/>',
  cal:   '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  swap:  '<path d="M7 4 3 8l4 4"/><path d="M3 8h13a5 5 0 0 1 0 10h-3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7"/><path d="M10 11v6M14 11v6"/>',
  list:  '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.1" fill="currentColor" stroke="none"/>'
};
function icon(name, size, cls){
  size = size || 18;
  return '<svg class="'+(cls||'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.info)+'</svg>';
}

/* ---------- badge trạng thái ---------- */
function badge(st){
  const s = STATUS[st] || {label:st};
  return '<span class="badge st-'+st+'"><span class="bd"></span>'+esc(s.label)+'</span>';
}

/* ---------- avatar chữ cái ---------- */
const AV_COLORS = ['#9B1C1C','#B45309','#0F766E','#1D4ED8','#6D28D9','#3730A3','#C2410C','#15803D','#A8841A','#4B5563'];
function avatar(name, size){
  const parts = String(name).trim().split(/\s+/);
  const init = (parts.length>1 ? parts[parts.length-2][0]+parts[parts.length-1][0] : parts[0].slice(0,2)).toUpperCase();
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
  const c = AV_COLORS[h % AV_COLORS.length];
  const st = size ? 'width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.36)+'px;' : '';
  return '<span class="avatar" style="background:'+c+';'+st+'" title="'+esc(name)+'">'+esc(init)+'</span>';
}

/* ---------- toast ---------- */
function toast(msg, kind){
  const root = $id('toast-root');
  const el = document.createElement('div');
  el.className = 'toast' + (kind==='ok'?' t-ok':kind==='warn'?' t-warn':'');
  el.innerHTML = (kind==='ok'?icon('check',16):kind==='warn'?icon('warn',16):icon('info',16)) + '<span>'+msg+'</span>';
  root.appendChild(el);
  setTimeout(()=>{ el.classList.add('hide'); setTimeout(()=>el.remove(), 320); }, 3400);
}

/* ---------- modal ---------- */
function openModal(title, bodyHTML, footHTML, wide){
  const root = $id('modal-root');
  root.innerHTML =
    '<div class="m-overlay" onclick="closeModal()"></div>'+
    '<div class="m-box" role="dialog" aria-modal="true"'+(wide?' style="max-width:720px"':'')+'>'+
      '<div class="m-head"><h3>'+title+'</h3><button class="m-x" onclick="closeModal()" aria-label="Đóng">✕</button></div>'+
      '<div class="m-body">'+bodyHTML+'</div>'+
      (footHTML ? '<div class="m-foot">'+footHTML+'</div>' : '')+
    '</div>';
  root.classList.add('open');
}
function closeModal(){ const r=$id('modal-root'); r.classList.remove('open'); r.innerHTML=''; }

/* ---------- drawer ---------- */
function openDrawer(title, bodyHTML){
  const root = $id('drawer-root');
  root.innerHTML =
    '<div class="m-overlay" onclick="closeDrawer()"></div>'+
    '<div class="d-panel" role="dialog" aria-modal="true">'+
      '<div class="d-head"><h3>'+title+'</h3><button class="m-x" onclick="closeDrawer()" aria-label="Đóng">✕</button></div>'+
      '<div class="d-body">'+bodyHTML+'</div>'+
    '</div>';
  root.classList.add('open');
}
function closeDrawer(){ const r=$id('drawer-root'); r.classList.remove('open'); r.innerHTML=''; }

document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeDrawer(); } });

/* =====================================================================
   Biểu đồ SVG thuần
   ===================================================================== */

/* Cột ngang — top địa phương */
function hBarChart(items, opts){
  opts = opts||{};
  const W = 560, rowH = 33, padL = 150, padR = 60, max = opts.max||100;
  const H = items.length*rowH + 8;
  let s = '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto" role="img" aria-label="Biểu đồ điểm theo địa phương">';
  // grid
  [0,25,50,75,100].forEach(v=>{
    const x = padL + (W-padL-padR)*v/max;
    s += '<line x1="'+x+'" y1="2" x2="'+x+'" y2="'+(H-4)+'" stroke="#EFE8DA" stroke-width="1"/>';
  });
  items.forEach((it,i)=>{
    const y = i*rowH+6, bw = (W-padL-padR)*Math.max(0,it.value)/max, bh = 17;
    const grad = it.hl ? 'url(#gGold)' : 'url(#gRed)';
    s += '<text x="'+(padL-9)+'" y="'+(y+bh-4)+'" text-anchor="end" font-size="11.5" font-weight="'+(it.hl?'800':'500')+'" fill="'+(it.hl?'#A8841A':'#5C554E')+'">'+esc(it.label)+'</text>';
    s += '<rect x="'+padL+'" y="'+y+'" width="'+(W-padL-padR)+'" height="'+bh+'" rx="5" fill="#F3EDE2"/>';
    s += '<rect x="'+padL+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="5" fill="'+grad+'"><animate attributeName="width" from="0" to="'+bw+'" dur="0.55s" fill="freeze"/></rect>';
    s += '<text x="'+(padL+bw+7)+'" y="'+(y+bh-4)+'" font-size="11.5" font-weight="700" fill="#2E2A26">'+fmt1(it.value)+'</text>';
  });
  s += '<defs>'+
       '<linearGradient id="gRed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B02A2A"/><stop offset="1" stop-color="#7F1414"/></linearGradient>'+
       '<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0BE4E"/><stop offset="1" stop-color="#A8841A"/></linearGradient>'+
       '</defs></svg>';
  return s;
}

/* Donut 9 trạng thái */
const STATUS_COLORS = {
  DRAFT:'#9CA3AF', SUBMITTED:'#3B82F6', IN_REVIEW:'#D97706', PENDING_APPROVAL:'#8B5CF6',
  SENT_TO_TW:'#14B8A6', TW_REVIEWING:'#6366F1', REVISION_REQUESTED:'#EA580C', APPROVED:'#22C55E', PUBLISHED:'#A3B32A'
};
function donutChart(counts){
  const entries = Object.keys(STATUS).map(k=>({k, n:counts[k]||0})).filter(e=>e.n>0);
  const total = entries.reduce((a,b)=>a+b.n,0) || 1;
  const R = 62, C = 2*Math.PI*R;
  let off = 0;
  let s = '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">';
  s += '<svg viewBox="0 0 170 170" style="width:168px;height:168px;flex:0 0 auto" role="img" aria-label="Phân bố trạng thái hồ sơ">';
  s += '<circle cx="85" cy="85" r="'+R+'" fill="none" stroke="#F3EDE2" stroke-width="21"/>';
  entries.forEach(e=>{
    const frac = e.n/total, len = frac*C;
    s += '<circle cx="85" cy="85" r="'+R+'" fill="none" stroke="'+STATUS_COLORS[e.k]+'" stroke-width="21" stroke-dasharray="'+(len-1.5)+' '+(C-len+1.5)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 85 85)" stroke-linecap="butt"/>';
    off += len;
  });
  s += '<text x="85" y="80" text-anchor="middle" font-size="27" font-weight="800" fill="#2E2A26">'+total+'</text>';
  s += '<text x="85" y="99" text-anchor="middle" font-size="10" font-weight="700" fill="#8A8177" letter-spacing="1">HỒ SƠ</text></svg>';
  s += '<div style="flex:1;min-width:190px;display:grid;grid-template-columns:1fr;gap:5px">';
  Object.keys(STATUS).forEach(k=>{
    const n = counts[k]||0;
    s += '<div style="display:flex;align-items:center;gap:8px;font-size:.78rem;'+(n===0?'opacity:.4':'')+'">'+
         '<i style="width:10px;height:10px;border-radius:3px;background:'+STATUS_COLORS[k]+';flex:0 0 auto"></i>'+
         '<span style="flex:1">'+esc(STATUS[k].label)+'</span><b class="mono">'+n+'</b></div>';
  });
  s += '</div></div>';
  return s;
}

/* Sparkline lịch sử điểm */
function sparkline(vals, w, hgt){
  w = w||190; hgt = hgt||46;
  if(!vals || !vals.length) return '<span class="muted">Chưa có dữ liệu</span>';
  const min = Math.min.apply(null,vals)-2, max = Math.max.apply(null,vals)+2;
  const pts = vals.map((v,i)=>{
    const x = 6 + i*(w-12)/(vals.length-1);
    const y = hgt-6 - (v-min)/(max-min)*(hgt-12);
    return [Math.round(x*10)/10, Math.round(y*10)/10];
  });
  const line = pts.map(p=>p.join(',')).join(' ');
  const area = '6,'+(hgt-2)+' '+line+' '+(w-6)+','+(hgt-2);
  let s = '<svg viewBox="0 0 '+w+' '+hgt+'" style="width:'+w+'px;height:'+hgt+'px" aria-hidden="true">';
  s += '<polygon points="'+area+'" fill="rgba(155,28,28,.08)"/>';
  s += '<polyline points="'+line+'" fill="none" stroke="#9B1C1C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  const last = pts[pts.length-1];
  s += '<circle cx="'+last[0]+'" cy="'+last[1]+'" r="3.2" fill="#C9A227" stroke="#fff" stroke-width="1.4"/>';
  s += '</svg>';
  return s;
}

/* Biểu đồ so sánh 2 kỳ (cột dọc ghép cặp) */
function compareChart(items){
  const W = 640, H = 250, padB = 42, padL = 34, padT = 14;
  const n = items.length, gw = (W-padL-10)/n;
  let s = '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto" role="img" aria-label="So sánh điểm hai kỳ">';
  [0,25,50,75,100].forEach(v=>{
    const y = H-padB - (H-padB-padT)*v/100;
    s += '<line x1="'+padL+'" y1="'+y+'" x2="'+(W-6)+'" y2="'+y+'" stroke="#EFE8DA"/>';
    s += '<text x="'+(padL-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="#8A8177">'+v+'</text>';
  });
  items.forEach((it,i)=>{
    const cx = padL + i*gw + gw/2, bw = Math.min(22, gw/3.2);
    const h1 = (H-padB-padT)*it.prev/100, h2 = (H-padB-padT)*it.cur/100;
    s += '<rect x="'+(cx-bw-2.5)+'" y="'+(H-padB-h1)+'" width="'+bw+'" height="'+h1+'" rx="4" fill="#D8CDBC"/>';
    s += '<rect x="'+(cx+2.5)+'" y="'+(H-padB-h2)+'" width="'+bw+'" height="'+h2+'" rx="4" fill="url(#gRed2)"><animate attributeName="height" from="0" to="'+h2+'" dur="0.5s" fill="freeze"/><animate attributeName="y" from="'+(H-padB)+'" to="'+(H-padB-h2)+'" dur="0.5s" fill="freeze"/></rect>';
    s += '<text x="'+(cx+2.5+bw/2)+'" y="'+(H-padB-h2-5)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#7F1414">'+fmt1(it.cur)+'</text>';
    const words = it.label.replace('Xã ','').replace('Thị trấn ','TT ');
    s += '<text x="'+cx+'" y="'+(H-padB+16)+'" text-anchor="middle" font-size="10.5" font-weight="600" fill="#5C554E">'+esc(words)+'</text>';
  });
  s += '<defs><linearGradient id="gRed2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C13333"/><stop offset="1" stop-color="#7F1414"/></linearGradient></defs>';
  s += '<g font-size="10.5" font-weight="600">'+
       '<rect x="'+padL+'" y="'+(H-14)+'" width="11" height="11" rx="3" fill="#D8CDBC"/><text x="'+(padL+16)+'" y="'+(H-5)+'" fill="#5C554E">Năm 2025</text>'+
       '<rect x="'+(padL+92)+'" y="'+(H-14)+'" width="11" height="11" rx="3" fill="#9B1C1C"/><text x="'+(padL+108)+'" y="'+(H-5)+'" fill="#5C554E">Năm 2026</text></g>';
  s += '</svg>';
  return s;
}

/* icon file theo loại */
function fileIcon(type){
  if(type==='img') return icon('img',13);
  if(type==='video') return icon('video',13);
  if(type==='xls') return icon('sum',13);
  return icon('file',13);
}
