/* =====================================================================
   app.js — trạng thái ứng dụng, điều hướng, RBAC, hành động luồng duyệt
   ===================================================================== */

/* ---------- store (dữ liệu động) ---------- */
const Store = {
  users: USERS,
  dossiers: DOSSIERS,
  activity: ACTIVITY
};

/* ---------- trạng thái UI ---------- */
const state = { role:'admin', screen:'dashboard' };
const ui = {
  dossierId:null,
  userQ:'', userRole:'', userStatus:'',
  hsQ:'', hsStatus:'',
  treeOpen:{}, treeSel:'kimlien',
  cgOpen:{}, sim:{}, subEdit:[], deptOpen:null
};

/* ---------- helpers dữ liệu ---------- */
function currentUser(){ return Store.users.find(u=>u.id===ROLES[state.role].userId); }
function myDeptId(){ const u=currentUser(); return (u && u.role==='truongphong') ? u.assigned[0] : null; }
function canManageDept(p){ if(state.role==='admin') return true; if(state.role==='truongphong') return p.id===myDeptId(); return false; }
function getDossier(id){ return Store.dossiers.find(d=>d.id===id); }
function flatLocalities(){
  const out=[];
  LOCALITIES.forEach(t=>t.children.forEach(h=>h.children.forEach(x=>out.push(x))));
  return out;
}
function findLocality(id){
  for(const t of LOCALITIES){
    if(t.id===id) return {node:t, path:[]};
    for(const h of t.children){
      if(h.id===id) return {node:h, path:[t.name]};
      for(const x of h.children){ if(x.id===id) return {node:x, path:[t.name, h.name]}; }
    }
  }
  return null;
}
function scopedLocalityIds(){
  if(state.role==='chuyenvien') return currentUser().assigned;
  return null;
}
function visibleDossiers(){
  const all = Store.dossiers;
  if(state.role==='chuyenvien'){ const a=currentUser().assigned; return all.filter(d=>a.includes(d.locality)); }
  if(state.role==='diaphuong'){ const a=currentUser().assigned; return all.filter(d=>a.includes(d.locality)); }
  if(state.role==='truongphong') return all.filter(d=>d.dept==='pb1');
  return all;
}
/* QL-TC-05: tiêu chí áp dụng cho một địa phương (được gán) */
function criteriaForLocality(locId){ return ALL_CRITERIA().filter(c => (c.localities||[]).indexOf(locId) >= 0); }
function applicableCriteria(d){ return criteriaForLocality(typeof d==='string' ? d : d.locality); }
/* tổng điểm có trọng số, tính trên các tiêu chí được gán cho địa phương (chuẩn hóa về thang 100) */
function weightedTotal(d){
  const crit = applicableCriteria(d);
  const Wsum = crit.reduce((a,c)=>a+(Number(c.weight)||0),0) || 100;
  let tRaw=0;
  crit.forEach(it=>{
    const sc=d.scores[it.id];
    if(sc && sc.score!=null && sc.score!=='') tRaw += Number(sc.score)*it.weight;
  });
  return tRaw / Wsum;
}
/* đảm bảo địa phương có hồ sơ thi đua (tạo mới ở trạng thái nháp nếu chưa có) */
function ensureDossier(locId){
  let d = Store.dossiers.find(x=>x.locality===locId);
  if(d) return d;
  const loc = flatLocalities().find(x=>x.id===locId); if(!loc) return null;
  const dept = DEPTS.find(p=>(p.localities||[]).indexOf(locId)>=0);
  const seq = String(Store.dossiers.length+1).padStart(3,'0');
  d = { id:'HS-2026-'+seq, locality:locId, localityName:loc.name, district:(loc.path?loc.path:''),
        dept:dept?dept.id:'', status:'DRAFT', deadline:'15/07/2026', total:null, bonus:[],
        selfCheck:{}, evidence:{}, scores:{}, reviewComment:'', rewardProposal:'',
        history:[{ time:now(), actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ kỳ "Năm 2026"', status:'DRAFT', note:'Tự tạo khi gán tiêu chí cho địa phương' }] };
  Store.dossiers.push(d);
  return d;
}
function finalTotal(d){
  const bonus = d.bonus.reduce((a,b)=>a+b.points,0);
  const n = Object.keys(d.scores).length;
  return round1((n?weightedTotal(d):(d.total||0)) + bonus);
}
function currentScoreOf(xaId){
  const d = Store.dossiers.find(x=>x.locality===xaId);
  if(d && d.total!=null) return finalTotal(d);
  const l = flatLocalities().find(x=>x.id===xaId);
  return l ? l.history[l.history.length-1] : 0;
}
function publishedRank(d){
  const pub = Store.dossiers.filter(x=>x.status==='PUBLISHED').sort((a,b)=>finalTotal(b)-finalTotal(a));
  return pub.findIndex(x=>x.id===d.id)+1;
}
function actionableCount(){
  const map = {
    diaphuong:['DRAFT','REVISION_REQUESTED'],
    chuyenvien:['SUBMITTED','IN_REVIEW'],
    truongphong:['PENDING_APPROVAL'],
    tw:['SENT_TO_TW','TW_REVIEWING','APPROVED'],
    admin:['DRAFT','REVISION_REQUESTED','SUBMITTED','IN_REVIEW','PENDING_APPROVAL','SENT_TO_TW','TW_REVIEWING','APPROVED']
  };
  const sts = map[state.role]||[];
  return visibleDossiers().filter(d=>sts.includes(d.status)).length;
}
function now(){
  const t = new Date();
  const hh = String(t.getHours()).padStart(2,'0'), mm = String(t.getMinutes()).padStart(2,'0');
  return '08/07/2026 '+hh+':'+mm;
}
function logH(d, action, note){
  d.history.push({ time:now(), actor:currentUser().name, role:ROLES[state.role].name, action:action, note:note||'', status:d.status });
}
function logFeed(txt){
  Store.activity.unshift({ time:now(), who:currentUser().name, txt:txt });
}

/* ---------- render ---------- */
function renderNav(){
  const items = NAV_ITEMS.filter(it=>it.roles.includes(state.role));
  const n = actionableCount();
  $id('nav').innerHTML = '<div class="nav-label">Nghiệp vụ</div>'+
    items.map(it=>
      '<button class="nav-item'+(state.screen===it.id?' active':'')+'" onclick="App.nav(\''+it.id+'\')">'+
      icon(it.icon,17)+'<span>'+it.label+'</span>'+
      (it.badge && n>0 ? '<span class="nav-badge" title="Hồ sơ chờ bạn xử lý">'+n+'</span>':'')+
      '</button>').join('');
}
function renderRoleSwitch(open){
  const u = currentUser(), r = ROLES[state.role];
  $id('role-switch').innerHTML =
    '<button class="role-btn" onclick="event.stopPropagation();App.toggleRoleMenu()" aria-haspopup="listbox" aria-expanded="'+(!!open)+'">'+
      avatar(u.name)+
      '<span><span class="rb-role">'+esc(r.name)+'</span><br><span class="rb-name">'+esc(u.name)+'</span></span>'+
      '<span class="caret">'+icon('down',15)+'</span></button>'+
    '<div class="role-menu'+(open?' open':'')+'" role="listbox">'+
      '<div class="rm-head">Chuyển vai trò (demo RBAC)</div>'+
      Object.values(ROLES).map(x=>{
        const xu = Store.users.find(uu=>uu.id===x.userId);
        return '<button class="role-opt'+(x.key===state.role?' cur':'')+'" onclick="App.switchRole(\''+x.key+'\')">'+
          avatar(xu.name)+'<span style="flex:1"><span class="ro-role">'+esc(x.name)+'</span><br><span class="ro-desc">'+esc(xu.name)+' · '+esc(x.desc)+'</span></span>'+
          (x.key===state.role?'<span class="tick">✓</span>':'')+'</button>';
      }).join('')+
    '</div>';
}
function renderBanner(){
  const r = ROLES[state.role];
  $id('rolebanner').innerHTML =
    '<div class="rb-inner"><span class="rb-ic" style="color:'+r.color+'">'+icon(state.role==='viewer'?'eye':state.role==='admin'?'shield':'user',18)+'</span>'+
    '<div class="rb-txt"><b>'+esc(r.name)+'</b> — '+r.banner+'</div></div>';
}
function renderScreen(){
  const fn = {
    dashboard:screenDashboard, hoso:screenDossiers, diaphuong:screenLocalities, phongban:screenDepartments,
    tieuchi:screenCriteria, nguoidung:screenUsers, baocao:screenReports, phanquyen:screenPermissions
  }[state.screen] || screenDashboard;
  $id('screen').innerHTML = fn();
  $id('tb-title').textContent = SCREEN_TITLES[state.screen] || 'Tổng quan';
  // restart animation
  const sc = $id('screen'); sc.style.animation='none'; void sc.offsetWidth; sc.style.animation='';
}
function renderAll(){
  renderNav(); renderRoleSwitch(false); renderBanner(); renderScreen();
}

/* ---------- router ---------- */
function parseHash(){
  const h = location.hash.replace(/^#\/?/,'');
  const parts = h.split('/');
  const scr = parts[0]||'dashboard';
  const allowed = NAV_ITEMS.some(it=>it.id===scr && it.roles.includes(state.role));
  state.screen = allowed ? scr : 'dashboard';
  ui.dossierId = (scr==='hoso' && parts[1]) ? parts[1] : null;
}
window.addEventListener('hashchange', ()=>{ parseHash(); renderAll(); });

/* ---------- App: hành động ---------- */
const App = {
  /* điều hướng */
  nav(scr){ location.hash = '#/'+scr; $id('sidebar').classList.remove('open'); },
  openDossier(id){ location.hash = '#/hoso/'+id; },
  backToList(){ location.hash = '#/hoso'; },
  toggleSidebar(){ $id('sidebar').classList.toggle('open'); },
  toggleRoleMenu(){
    const menu = document.querySelector('.role-menu');
    renderRoleSwitch(!(menu && menu.classList.contains('open')));
  },

  /* RBAC */
  switchRole(key){
    if(key===state.role){ renderRoleSwitch(false); return; }
    state.role = key;
    const allowed = NAV_ITEMS.some(it=>it.id===state.screen && it.roles.includes(key));
    if(!allowed){ location.hash='#/dashboard'; }
    // nếu đang xem hồ sơ ngoài phạm vi mới → quay về danh sách
    if(ui.dossierId){
      const d = getDossier(ui.dossierId);
      if(!d || !visibleDossiers().includes(d)) location.hash='#/hoso';
    }
    parseHash(); renderAll();
    toast('Đã chuyển sang vai trò <b>'+ROLES[key].name+'</b> — giao diện và phạm vi dữ liệu đã thay đổi','ok');
  },

  /* người dùng */
  userSearch(v){ ui.userQ=v; $id('user-tbody').innerHTML=userRows(); },
  userFilterRole(v){ ui.userRole=v; $id('user-tbody').innerHTML=userRows(); },
  userFilterStatus(v){ ui.userStatus=v; $id('user-tbody').innerHTML=userRows(); },
  toggleUserActive(id){
    const u = Store.users.find(x=>x.id===id);
    u.active = !u.active;
    u.logins.unshift([now(), u.active?'Tài khoản được kích hoạt bởi Admin':'Tài khoản bị vô hiệu hóa bởi Admin','—']);
    toast((u.active?'Đã kích hoạt':'Đã vô hiệu hóa')+' tài khoản <b>'+esc(u.name)+'</b> (QL-ND-03)', u.active?'ok':'warn');
    $id('user-tbody').innerHTML=userRows();
  },
  openUserDetail(id){
    const u = Store.users.find(x=>x.id===id);
    const scopeList = u.role==='chuyenvien' ? u.assigned.map(a=>{const l=flatLocalities().find(x=>x.id===a);return l?l.name:a;})
      : u.role==='diaphuong' ? u.assigned.map(a=>{const l=flatLocalities().find(x=>x.id===a);return l?l.name:a;})
      : u.role==='truongphong' ? u.assigned.map(a=>{const p=DEPTS.find(x=>x.id===a);return p?p.name:a;}) : [];
    openDrawer(esc(u.name),
      '<div class="flex mb12">'+avatar(u.name,46)+'<div><div class="t-strong" style="font-size:1rem">'+esc(u.name)+'</div>'+
      '<div class="t-dim">'+esc(u.email)+'</div></div><span class="ml-auto">'+(u.active?'<span class="pill pill-green">● Hoạt động</span>':'<span class="pill">○ Vô hiệu hóa</span>')+'</span></div>'+
      '<div class="d-sec">Thông tin tài khoản</div>'+
      info('Vai trò', u.roleName)+info('Đơn vị', u.unit)+
      '<div class="d-sec">Phân công phụ trách (QL-ND-06/07)</div>'+
      (scopeList.length?'<div class="chips">'+scopeList.map(s=>'<span class="chip">'+icon('map',12)+' '+esc(s)+'</span>').join('')+'</div>'
        :'<div class="t-dim" style="font-size:.84rem">Không giới hạn phạm vi (theo vai trò).</div>')+
      '<div class="d-sec">Lịch sử đăng nhập (QL-ND-08)</div>'+
      '<table class="tbl"><thead><tr><th>Thời điểm</th><th>Sự kiện</th><th>IP</th></tr></thead><tbody>'+
      u.logins.map(l=>'<tr><td class="mono t-dim">'+l[0]+'</td><td>'+esc(l[1])+'</td><td class="t-dim mono">'+l[2]+'</td></tr>').join('')+
      '</tbody></table>'+
      '<div class="flex mt16"><button class="btn btn-sm" onclick="toast(\'Đã gửi email đặt lại mật khẩu (QL-ND-04) — demo\',\'ok\')">'+icon('lock',13)+' Đặt lại mật khẩu</button>'+
      '<button class="btn btn-sm btn-ghost" onclick="toast(\'Mở form sửa thông tin (QL-ND-02) — demo\',\'ok\')">'+icon('edit',13)+' Sửa thông tin</button></div>'
    );
  },
  openCreateUser(){
    openModal('Tạo tài khoản mới (QL-ND-01)',
      '<div class="field"><label>Họ và tên <span class="req">*</span></label><input class="inp" id="nu-name" placeholder="VD: Nguyễn Văn An"></div>'+
      '<div class="field"><label>Email công vụ <span class="req">*</span></label><input class="inp" id="nu-email" placeholder="an.nv@mttq.vn"></div>'+
      '<div class="field"><label>Vai trò</label><select class="sel" id="nu-role">'+
        Object.values(ROLES).map(r=>'<option value="'+r.key+'">'+r.name+'</option>').join('')+'</select></div>'+
      '<div class="field"><label>Đơn vị</label><input class="inp" id="nu-unit" placeholder="VD: Phòng Phong trào"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.createUser()">'+icon('plus',14)+' Tạo tài khoản</button>');
  },
  createUser(){
    const name = $id('nu-name').value.trim(), email = $id('nu-email').value.trim();
    if(!name || !email){ toast('Vui lòng nhập đủ họ tên và email','warn'); return; }
    const role = $id('nu-role').value;
    Store.users.push({ id:'u'+(Store.users.length+1)+Date.now()%97, name:name, role:role, roleName:ROLES[role].name,
      unit:$id('nu-unit').value.trim()||'—', email:email, active:true, assigned:[], logins:[[now(),'Tài khoản được khởi tạo','—']] });
    closeModal();
    toast('Đã tạo tài khoản <b>'+esc(name)+'</b> và gửi email kích hoạt','ok');
    renderScreen();
  },

  /* địa phương */
  toggleTree(id){ ui.treeOpen[id] = ui.treeOpen[id]===false ? true : false; renderScreen(); },
  selectTree(id){ ui.treeSel = id; renderScreen(); },
  mockImport(){ toast('Đã nhận tệp <b>danh-sach-dia-phuong.xlsx</b> — 128 dòng hợp lệ, 0 lỗi (QL-DP-02, demo)','ok'); },
  openCreateLocality(){
    const huyens=[]; LOCALITIES.forEach(t=>t.children.forEach(h=>huyens.push({id:h.id,name:h.name+' ('+t.name+')'})));
    openModal('Thêm địa phương (QL-DP-01)',
      '<div class="field"><label>Tên đơn vị <span class="req">*</span></label><input class="inp" id="nl-name" placeholder="VD: Xã Hưng Phú"></div>'+
      '<div class="field"><label>Trực thuộc huyện</label><select class="sel" id="nl-parent">'+
        huyens.map(hh=>'<option value="'+hh.id+'">'+esc(hh.name)+'</option>').join('')+'</select></div>'+
      '<div class="field"><label>Chủ tịch MTTQ</label><input class="inp" id="nl-chair" placeholder="VD: Lê Văn Bốn"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.createLocality()">'+icon('plus',14)+' Thêm</button>');
  },
  createLocality(){
    const name = $id('nl-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên đơn vị','warn'); return; }
    const pid = $id('nl-parent').value;
    const parent = findLocality(pid).node;
    const nid = 'loc'+Date.now()%100000;
    parent.children.push({ id:nid, name:name, level:'xa', chairman:$id('nl-chair').value.trim()||'Chưa cập nhật', pop:'—', dept:'pb1', history:[70,71.5,73,74.2] });
    const pb=findDept('pb1'); if(pb && pb.localities.indexOf(nid)<0) pb.localities.push(nid); // đồng bộ QL-PB-03
    ui.treeSel = nid;
    closeModal(); toast('Đã thêm <b>'+esc(name)+'</b> vào cây địa phương','ok'); renderScreen();
  },

  /* ================= phòng ban (QL-PB) ================= */
  deptDetail(id){
    const p = findDept(id); if(!p) return;
    const canMng = canManageDept(p);
    ui.deptOpen = id;
    const prog = deptProgress(p);

    const mem = p.members.length ? p.members.map(mid=>{
      const u = Store.users.find(x=>x.id===mid); if(!u) return '';
      const pos = (p.positions&&p.positions[mid])||'Chuyên viên';
      return '<div class="mem-row"><div class="flex" style="flex:1">'+avatar(u.name,32)+
        '<div><div class="t-strong">'+esc(u.name)+'</div><div class="t-dim">'+esc(u.roleName)+(u.active?'':' · <span style="color:#C0392B">đã vô hiệu hóa</span>')+'</div></div></div>'+
        (canMng
          ? '<select class="sel sel-sm" onchange="App.setMemberPosition(\''+id+'\',\''+mid+'\',this.value)">'+
              ['Trưởng phòng','Phó phòng','Chuyên viên'].map(o=>'<option'+(o===pos?' selected':'')+'>'+o+'</option>').join('')+'</select>'+
            '<button class="icon-btn danger" title="Gỡ khỏi phòng" onclick="App.removeMember(\''+id+'\',\''+mid+'\')">'+icon('trash',13)+'</button>'
          : '<span class="pill">'+esc(pos)+'</span>')+
      '</div>';
    }).join('') : '<div class="t-dim" style="font-size:.85rem">Chưa có thành viên</div>';

    const locs = p.localities.length ? p.localities.map(lid=>{
      const l = flatLocalities().find(x=>x.id===lid); const d = Store.dossiers.find(x=>x.locality===lid);
      return '<tr><td>'+esc(l?l.name:lid)+'</td><td>'+(d?badge(d.status):'<span class="t-dim">—</span>')+'</td>'+
        (canMng?'<td style="text-align:right"><button class="icon-btn danger" title="Bỏ gán" onclick="App.unassignLocality(\''+id+'\',\''+lid+'\')">'+icon('trash',13)+'</button></td>':'<td></td>')+'</tr>';
    }).join('') : '<tr><td colspan="3"><span class="t-dim">Chưa được phân công</span></td></tr>';

    const wf = (p.workflow||[]).map((s,i,arr)=>
      '<div class="wf-step"><span class="wf-num">'+(i+1)+'</span><span class="wf-name">'+esc(s)+'</span>'+
      (canMng?'<span class="wf-ops">'+
        '<button class="icon-btn" title="Lên" '+(i===0?'disabled style="opacity:.35"':'onclick="App.moveWfStep(\''+id+'\','+i+',-1)"')+'>↑</button>'+
        '<button class="icon-btn" title="Xuống" '+(i===arr.length-1?'disabled style="opacity:.35"':'onclick="App.moveWfStep(\''+id+'\','+i+',1)"')+'>↓</button>'+
        '<button class="icon-btn danger" title="Xóa bước" onclick="App.removeWfStep(\''+id+'\','+i+')">'+icon('trash',13)+'</button>'+
      '</span>':'')+'</div>').join('') || '<div class="t-dim" style="font-size:.85rem">Chưa thiết lập</div>';

    openDrawer(esc(p.name)+' <span class="pill" style="text-transform:none;letter-spacing:0">'+esc(p.code||'')+'</span>'+(p.active===false?' <span class="pill">○ Ngừng hoạt động</span>':''),
      (p.desc?'<div class="t-dim mb12" style="font-size:.86rem">'+esc(p.desc)+'</div>':'')+
      (canMng?'<div class="flex mb12"><button class="btn btn-sm" onclick="App.openEditDept(\''+id+'\')">'+icon('edit',13)+' Sửa thông tin</button>'+
        '<button class="btn btn-sm btn-ghost" onclick="App.toggleDeptActive(\''+id+'\')">'+icon(p.active===false?'check':'lock',13)+' '+(p.active===false?'Kích hoạt':'Vô hiệu hóa')+'</button>'+
        (state.role==='admin'?'<button class="btn btn-sm btn-outline-danger ml-auto" onclick="App.deleteDept(\''+id+'\')">'+icon('trash',13)+' Xóa</button>':'')+'</div>':'')+

      '<div class="d-sec">Trưởng phòng (QL-PB-01)</div><div class="flex mb8">'+avatar(p.head,32)+'<b>'+esc(p.head)+'</b></div>'+

      '<div class="d-sec">Thành viên ('+p.members.length+') — QL-PB-02</div>'+mem+
      (canMng?'<button class="btn btn-sm mt8" onclick="App.openAddMember(\''+id+'\')">'+icon('plus',13)+' Thêm thành viên</button>':'')+

      '<div class="d-sec">Địa phương phụ trách ('+p.localities.length+') — QL-PB-03</div>'+
      '<table class="tbl"><thead><tr><th>Địa phương</th><th>Hồ sơ kỳ này</th><th></th></tr></thead><tbody>'+locs+'</tbody></table>'+
      (canMng?'<button class="btn btn-sm mt8" onclick="App.openAssignLoc(\''+id+'\')">'+icon('swap',13)+' Gán địa phương</button>':'')+

      '<div class="d-sec">Quy trình chấm điểm nội bộ (QL-PB-04)</div>'+
      '<div class="t-dim mb8" style="font-size:.8rem">Các bước duyệt trong phòng trước khi gửi Trung ương.</div>'+wf+
      (canMng?'<button class="btn btn-sm mt8" onclick="App.openAddWfStep(\''+id+'\')">'+icon('plus',13)+' Thêm bước</button>':'')+

      '<div class="d-sec">Tiến độ chấm điểm (QL-PB-05)</div>'+
      '<div class="leg"><span><i style="background:var(--green)"></i>Đã chấm '+prog.done+'</span><span><i style="background:var(--gold)"></i>Đang chấm '+prog.doing+'</span><span><i style="background:#D6CCBC"></i>Chưa chấm '+prog.notyet+'</span><span><i style="background:var(--red-strong)"></i>Quá hạn '+prog.late+'</span></div>');
  },
  refreshDept(id){ if(document.querySelector('.d-panel') && ui.deptOpen===id) App.deptDetail(id); },

  /* QL-PB-01: tạo / sửa phòng ban */
  openCreateDept(){
    openModal('Tạo phòng ban (QL-PB-01)',
      '<div style="display:flex;gap:12px"><div class="field" style="flex:2"><label>Tên phòng ban <span class="req">*</span></label><input class="inp" id="pb-name" placeholder="VD: Phòng Kinh tế – Xã hội"></div>'+
      '<div class="field" style="flex:1"><label>Mã</label><input class="inp" id="pb-code" placeholder="PB-KTXH"></div></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="pb-desc" placeholder="Chức năng, nhiệm vụ của phòng…"></textarea></div>'+
      '<div class="field"><label>Trưởng phòng ban</label><input class="inp" id="pb-head" placeholder="Họ tên trưởng phòng"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.createDept()">'+icon('plus',14)+' Tạo phòng ban</button>');
  },
  createDept(){
    const name=$id('pb-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên phòng ban','warn'); return; }
    const id=nextDeptId();
    DEPTS.push({ id:id, name:name, code:($id('pb-code').value.trim()||id.toUpperCase()), desc:$id('pb-desc').value.trim(),
      head:$id('pb-head').value.trim()||'Chưa bổ nhiệm', members:[], positions:{}, localities:[], active:true,
      workflow:['Chuyên viên chấm điểm','Trưởng phòng ban duyệt'] });
    closeModal(); toast('Đã tạo phòng ban <b>'+esc(name)+'</b>','ok'); renderScreen();
  },
  openEditDept(id){
    const p=findDept(id); if(!p) return;
    openModal('Sửa phòng ban '+esc(p.code||p.id)+' (QL-PB-01)',
      '<div style="display:flex;gap:12px"><div class="field" style="flex:2"><label>Tên phòng ban <span class="req">*</span></label><input class="inp" id="pb-name" value="'+esc(p.name)+'"></div>'+
      '<div class="field" style="flex:1"><label>Mã</label><input class="inp" id="pb-code" value="'+esc(p.code||'')+'"></div></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="pb-desc">'+esc(p.desc||'')+'</textarea></div>'+
      '<div class="field"><label>Trưởng phòng ban</label><input class="inp" id="pb-head" value="'+esc(p.head||'')+'"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveDept(\''+id+'\')">'+icon('check',14)+' Lưu thay đổi</button>');
  },
  saveDept(id){
    const p=findDept(id); if(!p) return;
    const name=$id('pb-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên phòng ban','warn'); return; }
    p.name=name; p.code=$id('pb-code').value.trim(); p.desc=$id('pb-desc').value.trim(); p.head=$id('pb-head').value.trim()||'Chưa bổ nhiệm';
    closeModal(); toast('Đã cập nhật phòng <b>'+esc(name)+'</b>','ok'); renderScreen(); App.refreshDept(id);
  },
  /* QL-PB-06: vô hiệu hóa / kích hoạt */
  toggleDeptActive(id){
    const p=findDept(id); if(!p) return;
    p.active = p.active===false ? true : false;
    toast('Đã '+(p.active?'kích hoạt':'vô hiệu hóa')+' phòng <b>'+esc(p.name)+'</b>'+(p.active?'':' — dữ liệu vẫn được giữ (QL-PB-06)'), p.active?'ok':'warn');
    renderScreen(); App.refreshDept(id);
  },
  deleteDept(id){
    const p=findDept(id); if(!p) return;
    openModal('Xóa phòng ban',
      '<div class="t-dim" style="font-size:.9rem">Xóa <b>'+esc(p.name)+'</b>? Theo QL-PB-06, khuyến nghị <b>vô hiệu hóa</b> để giữ lịch sử thay vì xóa. Thao tác demo không thể hoàn tác.</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-outline-danger" onclick="App.confirmDeleteDept(\''+id+'\')">'+icon('trash',14)+' Xóa phòng ban</button>');
  },
  confirmDeleteDept(id){
    const i=DEPTS.findIndex(p=>p.id===id); if(i<0) return;
    const p=DEPTS[i]; DEPTS.splice(i,1);
    closeModal(); closeDrawer(); toast('Đã xóa phòng ban <b>'+esc(p.name)+'</b>','warn'); renderScreen();
  },

  /* QL-PB-02: thành viên */
  openAddMember(id){
    const p=findDept(id); if(!p) return;
    const cands=Store.users.filter(u=>['chuyenvien','truongphong'].indexOf(u.role)>=0 && p.members.indexOf(u.id)<0);
    if(!cands.length){ toast('Không còn người dùng phù hợp để thêm','warn'); return; }
    openModal('Thêm thành viên vào '+esc(p.name)+' (QL-PB-02)',
      '<div class="field"><label>Chọn người dùng</label><select class="sel" id="mem-user">'+
        cands.map(u=>'<option value="'+u.id+'">'+esc(u.name)+' — '+esc(u.roleName)+(u.active?'':' (đã vô hiệu)')+'</option>').join('')+'</select></div>'+
      '<div class="field"><label>Chức vụ trong phòng</label><select class="sel" id="mem-pos"><option>Chuyên viên</option><option>Phó phòng</option><option>Trưởng phòng</option></select></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.addMember(\''+id+'\')">'+icon('plus',14)+' Thêm</button>');
  },
  addMember(id){
    const p=findDept(id); if(!p) return;
    const uid=$id('mem-user').value, pos=$id('mem-pos').value;
    if(!uid) return;
    if(p.members.indexOf(uid)<0) p.members.push(uid);
    p.positions=p.positions||{}; p.positions[uid]=pos;
    const u=Store.users.find(x=>x.id===uid);
    closeModal(); toast('Đã thêm <b>'+esc(u?u.name:uid)+'</b> với chức vụ '+esc(pos),'ok'); renderScreen(); App.refreshDept(id);
  },
  removeMember(id, uid){
    const p=findDept(id); if(!p) return;
    p.members=p.members.filter(m=>m!==uid); if(p.positions) delete p.positions[uid];
    toast('Đã gỡ thành viên khỏi phòng','warn'); renderScreen(); App.refreshDept(id);
  },
  setMemberPosition(id, uid, pos){
    const p=findDept(id); if(!p) return; p.positions=p.positions||{}; p.positions[uid]=pos;
    toast('Đã đổi chức vụ thành <b>'+esc(pos)+'</b>','ok');
  },

  /* QL-PB-03: gán địa phương */
  openAssignLoc(id){
    const p=findDept(id); if(!p) return;
    const all=flatLocalities();
    openModal('Gán địa phương cho '+esc(p.name)+' (QL-PB-03)',
      '<div class="t-dim mb12" style="font-size:.83rem">Một địa phương có thể do nhiều phòng cùng quản lý. Tích chọn các đơn vị phòng phụ trách.</div>'+
      '<div class="loc-pick">'+all.map(l=>{
        const on=p.localities.indexOf(l.id)>=0;
        return '<label class="ev-check'+(on?' on':'')+'"><input type="checkbox" value="'+l.id+'"'+(on?' checked':'')+
          ' onchange="this.closest(\'.ev-check\').classList.toggle(\'on\',this.checked)"> '+esc(l.name)+'</label>';
      }).join('')+'</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveAssignLoc(\''+id+'\')">'+icon('check',14)+' Lưu phân công</button>');
  },
  saveAssignLoc(id){
    const p=findDept(id); if(!p) return;
    p.localities=Array.from(document.querySelectorAll('.loc-pick input:checked')).map(i=>i.value);
    closeModal(); toast('Đã cập nhật <b>'+p.localities.length+' địa phương</b> cho phòng','ok'); renderScreen(); App.refreshDept(id);
  },
  unassignLocality(id, lid){
    const p=findDept(id); if(!p) return;
    p.localities=p.localities.filter(x=>x!==lid);
    toast('Đã bỏ gán địa phương','warn'); renderScreen(); App.refreshDept(id);
  },

  /* QL-PB-04: quy trình chấm điểm nội bộ */
  openAddWfStep(id){
    openModal('Thêm bước duyệt nội bộ (QL-PB-04)',
      '<div class="field"><label>Tên bước <span class="req">*</span></label><input class="inp" id="wf-name" placeholder="VD: Phó phòng rà soát"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.addWfStep(\''+id+'\')">'+icon('plus',14)+' Thêm bước</button>');
  },
  addWfStep(id){
    const p=findDept(id); if(!p) return;
    const name=$id('wf-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên bước','warn'); return; }
    p.workflow=p.workflow||[]; p.workflow.push(name);
    closeModal(); toast('Đã thêm bước <b>'+esc(name)+'</b>','ok'); App.refreshDept(id);
  },
  removeWfStep(id, i){ const p=findDept(id); if(!p) return; p.workflow.splice(i,1); App.refreshDept(id); },
  moveWfStep(id, i, dir){
    const p=findDept(id); if(!p) return; const j=i+dir;
    if(j<0||j>=p.workflow.length) return;
    const t=p.workflow[i]; p.workflow[i]=p.workflow[j]; p.workflow[j]=t; App.refreshDept(id);
  },

  /* tiêu chí */
  toggleGroup(id){ ui.cgOpen[id] = ui.cgOpen[id]===false ? true : false; renderScreen(); },
  simSet(id, v){
    ui.sim[id] = Number(v);
    const el = $id('sim-'+id); if(el) el.textContent = v+' đ';
    const t = $id('sim-total'); if(t) t.textContent = fmt1(simTotal());
  },

  /* ---- CRUD nhóm tiêu chí (QL-TC-01) ---- */
  openCreateGroup(){
    const cur = CRITERIA_GROUPS.reduce((a,g)=>a+g.weight,0);
    openModal('Tạo nhóm tiêu chí (QL-TC-01)',
      '<div class="field"><label>Tên nhóm <span class="req">*</span></label><input class="inp" id="g-name" placeholder="VD: Công tác đối ngoại nhân dân"></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="g-desc" placeholder="Mô tả ngắn về nhóm tiêu chí…"></textarea></div>'+
      '<div class="field"><label>Trọng số nhóm (%) <span class="req">*</span></label><input class="inp" id="g-weight" type="number" min="0" max="100" step="1" value="10" style="max-width:140px"></div>'+
      '<div class="t-dim" style="font-size:.8rem">Tổng trọng số các nhóm hiện tại: <b>'+fmt1(cur)+'%</b> — theo QL-TC-01 tổng phải đạt đúng 100%.</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.createGroup()">'+icon('plus',14)+' Tạo nhóm</button>');
  },
  createGroup(){
    const name = $id('g-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên nhóm','warn'); return; }
    const id = nextGroupId();
    CRITERIA_GROUPS.push({ id:id, name:name, desc:$id('g-desc').value.trim(), weight:Math.max(0,Number($id('g-weight').value)||0), items:[] });
    closeModal(); toast('Đã tạo nhóm <b>'+esc(name)+'</b> (mã '+id+')','ok'); renderScreen();
  },
  openEditGroup(gid){
    const g = findGroup(gid); if(!g) return;
    openModal('Sửa nhóm '+g.id+' (QL-TC-01)',
      '<div class="field"><label>Tên nhóm <span class="req">*</span></label><input class="inp" id="g-name" value="'+esc(g.name)+'"></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="g-desc">'+esc(g.desc||'')+'</textarea></div>'+
      '<div class="field"><label>Trọng số nhóm (%)</label><input class="inp" id="g-weight" type="number" min="0" max="100" value="'+g.weight+'" style="max-width:140px"></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveGroup(\''+gid+'\')">'+icon('check',14)+' Lưu thay đổi</button>');
  },
  saveGroup(gid){
    const g = findGroup(gid); if(!g) return;
    const name = $id('g-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên nhóm','warn'); return; }
    g.name = name; g.desc = $id('g-desc').value.trim(); g.weight = Math.max(0,Number($id('g-weight').value)||0);
    closeModal(); toast('Đã cập nhật nhóm <b>'+esc(name)+'</b>','ok'); renderScreen();
  },
  deleteGroup(gid){
    const g = findGroup(gid); if(!g) return;
    openModal('Xóa nhóm '+g.id,
      '<div class="t-dim" style="font-size:.9rem">Bạn sắp xóa nhóm <b>'+esc(g.name)+'</b> cùng <b>'+g.items.length+' tiêu chí</b> bên trong. '+
      'Lưu ý QL-TC-04: trong hệ thống thật, bộ tiêu chí cũ được lưu theo phiên bản thay vì xóa. Thao tác demo này không thể hoàn tác.</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-outline-danger" onclick="App.confirmDeleteGroup(\''+gid+'\')">'+icon('trash',14)+' Xóa nhóm</button>');
  },
  confirmDeleteGroup(gid){
    const i = CRITERIA_GROUPS.findIndex(g=>g.id===gid); if(i<0) return;
    const g = CRITERIA_GROUPS[i]; CRITERIA_GROUPS.splice(i,1);
    closeModal(); toast('Đã xóa nhóm <b>'+esc(g.name)+'</b>','warn'); renderScreen();
  },

  /* ---- CRUD tiêu chí (QL-TC-02) ---- */
  openCreateCrit(gid){
    const g = findGroup(gid); if(!g) return;
    const nid = nextCritId(gid);
    openModal('Thêm tiêu chí vào nhóm '+g.id+' (QL-TC-02)',
      '<div class="field"><label>Mã tiêu chí</label><input class="inp" id="c-id" value="'+nid+'" style="max-width:140px"></div>'+
      '<div class="field"><label>Tên tiêu chí <span class="req">*</span></label><input class="inp" id="c-name" placeholder="VD: Vận động nhân dân tham gia bảo vệ môi trường"></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="c-desc" placeholder="Mô tả nội dung, cách đánh giá…"></textarea></div>'+
      '<div style="display:flex;gap:12px"><div class="field" style="flex:1"><label>Thang điểm</label>'+scaleSelect('c-scale',100)+'</div>'+
        '<div class="field" style="flex:1"><label>Trọng số (%) <span class="req">*</span></label><input class="inp" id="c-weight" type="number" min="0" max="100" step="0.5" value="10"></div></div>'+
      '<div class="field"><label>Loại bằng chứng yêu cầu</label>'+evChecks(['Báo cáo'])+'</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.createCrit(\''+gid+'\')">'+icon('plus',14)+' Thêm tiêu chí</button>');
  },
  createCrit(gid){
    const g = findGroup(gid); if(!g) return;
    const name = $id('c-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên tiêu chí','warn'); return; }
    let id = ($id('c-id').value.trim() || nextCritId(gid)).toUpperCase();
    if(findCrit(id)){ toast('Mã <b>'+esc(id)+'</b> đã tồn tại — vui lòng đổi mã khác','warn'); return; }
    const ev = readEvChecks();
    g.items.push({ id:id, name:name, desc:$id('c-desc').value.trim(), weight:Math.max(0,Number($id('c-weight').value)||0),
      scale:Number($id('c-scale').value)||100, subs:[], evidence:ev.length?ev:['Báo cáo'] });
    closeModal(); toast('Đã thêm tiêu chí <b>'+esc(id)+' — '+esc(name)+'</b>','ok'); renderScreen();
  },
  openEditCrit(cid){
    const f = findCrit(cid); if(!f) return; const it = f.item;
    openModal('Sửa tiêu chí '+it.id+' (QL-TC-02)',
      '<div class="field"><label>Mã tiêu chí</label><input class="inp" value="'+it.id+'" disabled style="max-width:140px;opacity:.65"></div>'+
      '<div class="field"><label>Tên tiêu chí <span class="req">*</span></label><input class="inp" id="c-name" value="'+esc(it.name)+'"></div>'+
      '<div class="field"><label>Mô tả</label><textarea class="txa" id="c-desc">'+esc(it.desc||'')+'</textarea></div>'+
      '<div style="display:flex;gap:12px"><div class="field" style="flex:1"><label>Thang điểm</label>'+scaleSelect('c-scale',it.scale)+'</div>'+
        '<div class="field" style="flex:1"><label>Trọng số (%)</label><input class="inp" id="c-weight" type="number" min="0" max="100" step="0.5" value="'+it.weight+'"></div></div>'+
      '<div class="field"><label>Loại bằng chứng yêu cầu</label>'+evChecks(it.evidence)+'</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveCrit(\''+cid+'\')">'+icon('check',14)+' Lưu thay đổi</button>');
  },
  saveCrit(cid){
    const f = findCrit(cid); if(!f) return; const it = f.item;
    const name = $id('c-name').value.trim();
    if(!name){ toast('Vui lòng nhập tên tiêu chí','warn'); return; }
    it.name = name; it.desc = $id('c-desc').value.trim(); it.weight = Math.max(0,Number($id('c-weight').value)||0); it.scale = Number($id('c-scale').value)||100;
    const ev = readEvChecks(); it.evidence = ev.length?ev:['Báo cáo'];
    closeModal(); toast('Đã cập nhật tiêu chí <b>'+esc(it.id)+'</b>','ok'); renderScreen();
  },
  deleteCrit(cid){
    const f = findCrit(cid); if(!f) return; const it = f.item;
    openModal('Xóa tiêu chí '+it.id,
      '<div class="t-dim" style="font-size:.9rem">Xóa tiêu chí <b>'+esc(it.id)+' — '+esc(it.name)+'</b> khỏi nhóm '+f.group.id+'? '+
      'Điểm đã chấm theo tiêu chí này (nếu có) sẽ không còn được tính vào tổng. Thao tác demo không thể hoàn tác.</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-outline-danger" onclick="App.confirmDeleteCrit(\''+cid+'\')">'+icon('trash',14)+' Xóa tiêu chí</button>');
  },
  confirmDeleteCrit(cid){
    const f = findCrit(cid); if(!f) return;
    f.group.items.splice(f.idx,1);
    closeModal(); toast('Đã xóa tiêu chí <b>'+esc(cid)+'</b>','warn'); renderScreen();
  },

  /* ---- chỉ số con (QL-TC-03) ---- */
  openSubs(cid){
    const f = findCrit(cid); if(!f) return; const it = f.item;
    ui.subEdit = (it.subs||[]).map(s=>({ name:subLabel(s), scale:subScale(s,it.scale) }));
    openModal('Chỉ số con — '+it.id+' (QL-TC-03)',
      '<div class="t-dim mb12" style="font-size:.83rem"><b>'+esc(it.name)+'</b><br>Mỗi chỉ số con có thể có thang điểm riêng.</div>'+
      '<div id="sub-editor">'+subEditorHTML()+'</div>'+
      '<button class="btn btn-sm mt8" onclick="App.addSubRow()">'+icon('plus',13)+' Thêm chỉ số con</button>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveSubs(\''+cid+'\')">'+icon('check',14)+' Lưu chỉ số con</button>');
  },
  syncSubEdit(){
    Array.from(document.querySelectorAll('#sub-editor .sub-item')).forEach((row,i)=>{
      if(!ui.subEdit[i]) return;
      ui.subEdit[i].name = row.querySelector('.sub-name').value;
      ui.subEdit[i].scale = Number(row.querySelector('.sub-scale').value)||100;
    });
  },
  addSubRow(){ App.syncSubEdit(); ui.subEdit.push({name:'', scale:100}); $id('sub-editor').innerHTML = subEditorHTML(); },
  removeSubRow(i){ App.syncSubEdit(); ui.subEdit.splice(i,1); $id('sub-editor').innerHTML = subEditorHTML(); },
  saveSubs(cid){
    App.syncSubEdit();
    const f = findCrit(cid); if(!f) return;
    const subs = ui.subEdit.map(s=>({ name:(s.name||'').trim(), scale:Number(s.scale)||100 })).filter(s=>s.name);
    f.item.subs = subs;
    closeModal(); toast('Đã lưu <b>'+subs.length+' chỉ số con</b> cho tiêu chí '+cid,'ok'); renderScreen();
  },

  /* ---- QL-TC-05: gán địa phương vào tiêu chí ---- */
  openAssignCritLoc(cid){
    const f=findCrit(cid); if(!f) return; const it=f.item;
    const all=flatLocalities();
    openModal('Gán địa phương chấm tiêu chí '+it.id+' (QL-TC-05)',
      '<div class="t-dim mb12" style="font-size:.83rem"><b>'+esc(it.name)+'</b><br>Địa phương được tích chọn sẽ phải nộp bằng chứng &amp; được chấm theo tiêu chí này.</div>'+
      '<div class="flex mb8" style="gap:8px"><button class="btn btn-sm" onclick="App.critLocAll(true)">Chọn tất cả</button><button class="btn btn-sm btn-ghost" onclick="App.critLocAll(false)">Bỏ chọn</button></div>'+
      '<div class="loc-pick">'+all.map(l=>{
        const on=(it.localities||[]).indexOf(l.id)>=0;
        return '<label class="ev-check'+(on?' on':'')+'"><input type="checkbox" value="'+l.id+'"'+(on?' checked':'')+
          ' onchange="this.closest(\'.ev-check\').classList.toggle(\'on\',this.checked)"> '+esc(l.name)+'</label>';
      }).join('')+'</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.saveAssignCritLoc(\''+cid+'\')">'+icon('check',14)+' Lưu phân công</button>');
  },
  critLocAll(on){ document.querySelectorAll('.loc-pick .ev-check').forEach(l=>{ const cb=l.querySelector('input'); cb.checked=on; l.classList.toggle('on',on); }); },
  saveAssignCritLoc(cid){
    const f=findCrit(cid); if(!f) return;
    const ids=Array.from(document.querySelectorAll('.loc-pick input:checked')).map(i=>i.value);
    f.item.localities = ids;
    ids.forEach(lid=>ensureDossier(lid));
    closeModal(); toast('Đã gán tiêu chí <b>'+cid+'</b> cho <b>'+ids.length+' địa phương</b> (QL-TC-05)','ok'); renderScreen();
  },
  /* ban hành toàn bộ bộ tiêu chí cho (các) địa phương — gán mọi tiêu chí cùng lúc */
  openPublishCriteria(){
    const all=flatLocalities();
    openModal('Ban hành bộ tiêu chí cho địa phương (QL-TC-05)',
      '<div class="t-dim mb12" style="font-size:.83rem">Chọn địa phương để áp dụng <b>toàn bộ bộ tiêu chí '+CRITERIA_VERSION+'</b>. Mỗi địa phương được chọn sẽ có hồ sơ thi đua để nộp &amp; chấm. <i>Thao tác này đặt lại phạm vi áp dụng cho tất cả tiêu chí.</i></div>'+
      '<div class="flex mb8" style="gap:8px"><button class="btn btn-sm" onclick="App.critLocAll(true)">Chọn tất cả</button><button class="btn btn-sm btn-ghost" onclick="App.critLocAll(false)">Bỏ chọn</button></div>'+
      '<div class="loc-pick">'+all.map(l=>{
        const on=ALL_CRITERIA().length>0 && ALL_CRITERIA().every(c=>(c.localities||[]).indexOf(l.id)>=0);
        return '<label class="ev-check'+(on?' on':'')+'"><input type="checkbox" value="'+l.id+'"'+(on?' checked':'')+
          ' onchange="this.closest(\'.ev-check\').classList.toggle(\'on\',this.checked)"> '+esc(l.name)+'</label>';
      }).join('')+'</div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.savePublishCriteria()">'+icon('check',14)+' Ban hành</button>');
  },
  savePublishCriteria(){
    const ids=Array.from(document.querySelectorAll('.loc-pick input:checked')).map(i=>i.value);
    CRITERIA_GROUPS.forEach(g=>g.items.forEach(c=>{ c.localities = ids.slice(); })); // dữ liệu gốc, không dùng bản sao ALL_CRITERIA()
    ids.forEach(lid=>ensureDossier(lid));
    closeModal(); toast('Đã ban hành bộ tiêu chí cho <b>'+ids.length+' địa phương</b> — hồ sơ thi đua đã sẵn sàng (QL-TC-05)','ok'); renderScreen();
  },

  /* ---- nhập/xuất bộ tiêu chí (QL-TC-08) ---- */
  mockImportCriteria(){ toast('Đã nhập bộ tiêu chí từ <b>bo-tieu-chi-2026.xlsx</b> — '+CRITERIA_GROUPS.length+' nhóm, '+ALL_CRITERIA().length+' tiêu chí hợp lệ (QL-TC-08, demo)','ok'); },
  mockExportCriteria(){ toast('Đã kết xuất bộ tiêu chí ra <b>bo-tieu-chi-2026.xlsx</b> theo template chuẩn (QL-TC-08, demo)','ok'); },

  /* ============ luồng hồ sơ 5 bước ============ */
  addEvidence(dId, critId){
    const crit = ALL_CRITERIA().find(c=>c.id===critId);
    openModal('Tải bằng chứng — tiêu chí '+critId,
      '<div class="t-dim mb12" style="font-size:.83rem">'+esc(crit.name)+'<br>Loại chấp nhận: '+crit.evidence.join(', ')+'</div>'+
      '<div class="field"><label>Tên tệp</label><input class="inp" id="ev-name" value="minh-chung-'+critId.toLowerCase()+'-kimlien.pdf"></div>'+
      '<div class="field"><label>Loại tệp</label><select class="sel" id="ev-type">'+
      '<option value="pdf">Tài liệu PDF</option><option value="img">Hình ảnh</option><option value="video">Video</option><option value="xls">Bảng tính</option></select></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.confirmEvidence(\''+dId+'\',\''+critId+'\')">'+icon('upload',14)+' Tải lên</button>');
  },
  confirmEvidence(dId, critId){
    const d = getDossier(dId);
    const name = $id('ev-name').value.trim()||('minh-chung-'+critId+'.pdf');
    (d.evidence[critId] = d.evidence[critId]||[]).push({name:name, type:$id('ev-type').value});
    closeModal(); toast('Đã đính kèm <b>'+esc(name)+'</b> vào tiêu chí '+critId,'ok'); renderScreen();
  },
  removeEvidence(dId, critId, i){
    const d = getDossier(dId);
    d.evidence[critId].splice(i,1);
    if(!d.evidence[critId].length) delete d.evidence[critId];
    renderScreen();
  },
  quickFillEvidence(dId){
    const d = getDossier(dId);
    let added=0;
    const slug=(d.localityName||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'dp';
    applicableCriteria(d).forEach(it=>{
      if(!(d.evidence[it.id]||[]).length){
        const type = it.evidence.includes('Hình ảnh')?'img':it.evidence.includes('Video')?'video':'pdf';
        const ext = type==='img'?'.jpg':type==='video'?'.mp4':'.pdf';
        d.evidence[it.id]=[{name:'minh-chung-'+it.id.toLowerCase()+'-'+slug+ext, type:type}];
        added++;
      }
      d.selfCheck[it.id]=1;
    });
    toast(added?('Đã đính kèm nhanh <b>'+added+' tệp mẫu</b> và tự đánh giá đủ '+applicableCriteria(d).length+' tiêu chí được gán'):'Bộ hồ sơ đã đầy đủ bằng chứng','ok');
    renderScreen();
  },
  toggleSelfCheck(dId, critId){
    const d = getDossier(dId);
    if(d.selfCheck[critId]) delete d.selfCheck[critId]; else d.selfCheck[critId]=1;
  },
  submitDossier(dId){
    const d = getDossier(dId);
    const ev = Object.values(d.evidence).reduce((a,b)=>a+b.length,0);
    const sc = Object.keys(d.selfCheck).length;
    const N = applicableCriteria(d).length;
    if(N === 0){ toast('Địa phương <b>chưa được gán tiêu chí thi đua</b> nào — vào màn Tiêu chí → “Gán địa phương” (QL-TC-05) trước khi nộp.','warn'); return; }
    const need = Math.min(5, N);
    if(ev < need){
      toast('Hồ sơ chưa đủ điều kiện nộp: cần bằng chứng cho ít nhất <b>'+need+'</b> tiêu chí (hiện có '+ev+' tệp). Dùng nút "Đính kèm nhanh bộ mẫu". <i>Tự đánh giá là tùy chọn.</i>','warn');
      return;
    }
    const resub = d.status==='REVISION_REQUESTED';
    d.status='SUBMITTED';
    logH(d, resub?'Nộp lại hồ sơ sau chỉnh sửa':'Nộp hồ sơ (DU-01)', 'Đính kèm '+ev+' bằng chứng, tự đánh giá '+sc+'/'+N+' tiêu chí (tùy chọn)');
    logFeed((resub?'nộp lại':'nộp')+' hồ sơ <b>'+d.id+'</b> ('+esc(d.localityName)+') với '+ev+' bằng chứng');
    toast('Đã nộp hồ sơ <b>'+d.id+'</b> — hệ thống đã <b>thông báo cho phòng ban phụ trách</b>. Bước tiếp theo: Chuyên viên chấm điểm (B2)','ok');
    renderAll();
  },
  startReview(dId){
    const d = getDossier(dId);
    d.status='IN_REVIEW';
    logH(d,'Tiếp nhận và bắt đầu chấm điểm (DU-02)','');
    logFeed('bắt đầu chấm điểm hồ sơ <b>'+d.id+'</b> ('+esc(d.localityName)+')');
    toast('Bắt đầu chấm điểm — nhập điểm 0–100 cho từng tiêu chí','ok');
    renderAll();
  },
  setScore(dId, critId, v){
    const d = getDossier(dId);
    if(v===''){ delete d.scores[critId]; }
    else{
      let n = Math.max(0, Math.min(100, Number(v)));
      d.scores[critId] = Object.assign(d.scores[critId]||{note:''}, {score:n});
    }
    const box = $id('score-summary'); if(box) box.innerHTML = scoreSummary(d);
  },
  setReviewComment(dId, v){ getDossier(dId).reviewComment = v; },
  setRewardProposal(dId, v){ getDossier(dId).rewardProposal = v; },
  fillSampleScores(dId){
    const d = getDossier(dId);
    const sample = {A1:86, A2:84, B1:88, B2:81, B3:90, C1:85, C2:83, D1:87, D2:84};
    applicableCriteria(d).forEach(it=>{ const v=sample[it.id]!=null?sample[it.id]:85; d.scores[it.id]=Object.assign(d.scores[it.id]||{note:''},{score:v}); });
    if(!d.reviewComment) d.reviewComment='Hồ sơ đầy đủ, bằng chứng thuyết phục. Quê hương Chủ tịch Hồ Chí Minh duy trì phong trào tốt, nổi bật ở Quỹ "Vì người nghèo" và xây dựng nông thôn mới kiểu mẫu.';
    toast('Đã điền bộ điểm gợi ý và nhận xét mẫu — bạn có thể chỉnh lại từng ô','ok');
    renderScreen();
  },
  sendToHead(dId){
    const d = getDossier(dId);
    const missing = applicableCriteria(d).filter(it=>!(d.scores[it.id]&&d.scores[it.id].score!=null)).map(it=>it.id);
    if(missing.length){ toast('Chưa chấm đủ '+applicableCriteria(d).length+' tiêu chí — còn thiếu: <b>'+missing.join(', ')+'</b>','warn'); return; }
    if(!d.reviewComment.trim()){ toast('Vui lòng nhập <b>nhận xét tổng hợp</b> (bắt buộc) trước khi gửi','warn'); return; }
    d.total = round1(weightedTotal(d));
    d.status='PENDING_APPROVAL';
    logH(d,'Hoàn tất chấm điểm, gửi trưởng phòng duyệt','Tổng điểm sơ bộ: '+fmt1(d.total));
    logFeed('hoàn tất chấm điểm <b>'+d.id+'</b> — tổng '+fmt1(d.total)+' điểm, chờ trưởng phòng duyệt');
    toast('Đã gửi trưởng phòng duyệt — tổng điểm sơ bộ <b>'+fmt1(d.total)+'</b>','ok');
    renderAll();
  },
  requestEvidence(dId){
    openModal('Yêu cầu bổ sung bằng chứng (DU-03)',
      '<div class="field"><label>Lý do / nội dung cần bổ sung <span class="req">*</span></label>'+
      '<textarea class="txa" id="req-reason" placeholder="VD: Thiếu chứng từ Quỹ Vì người nghèo (B3)…"></textarea></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.confirmRequestEvidence(\''+dId+'\')">'+icon('send',14)+' Gửi yêu cầu</button>');
  },
  confirmRequestEvidence(dId){
    const reason = $id('req-reason').value.trim();
    if(!reason){ toast('Vui lòng nhập lý do yêu cầu bổ sung','warn'); return; }
    const d = getDossier(dId);
    d.status='REVISION_REQUESTED';
    logH(d,'Yêu cầu bổ sung bằng chứng (DU-03)', reason);
    logFeed('yêu cầu bổ sung bằng chứng hồ sơ <b>'+d.id+'</b>');
    closeModal(); toast('Đã gửi yêu cầu bổ sung về địa phương','ok'); renderAll();
  },
  approveSend(dId){
    const d = getDossier(dId);
    const before = d.total;
    d.total = round1(weightedTotal(d)); // trưởng phòng có thể đã điều chỉnh điểm (bước 18)
    const adjusted = before!=null && Math.abs(before-d.total)>0.05;
    d.status='SENT_TO_TW';
    logH(d,'Trưởng phòng duyệt kết quả, gửi Trung ương (DU-04)', adjusted?('Đã điều chỉnh điểm: '+fmt1(before)+' → '+fmt1(d.total)):'Nhất trí với kết quả chấm của chuyên viên');
    logFeed('duyệt và gửi Trung ương hồ sơ <b>'+d.id+'</b> ('+esc(d.localityName)+')');
    toast('Đã duyệt và gửi hồ sơ lên <b>Trung ương</b> (B4)'+(adjusted?' — tổng điểm điều chỉnh còn '+fmt1(d.total):''),'ok');
    renderAll();
  },
  returnDossier(dId){
    openModal('Hoàn trả hồ sơ (DU-06)',
      '<div class="t-dim mb12" style="font-size:.85rem">Hồ sơ sẽ quay lại bước chấm điểm của chuyên viên. Lý do là bắt buộc.</div>'+
      '<div class="field"><label>Lý do hoàn trả <span class="req">*</span></label>'+
      '<textarea class="txa" id="ret-reason" placeholder="VD: Điểm C1 chưa khớp biên bản giám sát, đề nghị chấm lại…"></textarea></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-outline-danger" onclick="App.confirmReturn(\''+dId+'\')">'+icon('back',14)+' Hoàn trả</button>');
  },
  confirmReturn(dId){
    const reason = $id('ret-reason').value.trim();
    if(!reason){ toast('Lý do hoàn trả là bắt buộc (DU-06)','warn'); return; }
    const d = getDossier(dId);
    d.status='IN_REVIEW';
    logH(d,'Trưởng phòng hoàn trả để chấm lại (DU-06)', reason);
    logFeed('hoàn trả hồ sơ <b>'+d.id+'</b> để chuyên viên chấm lại');
    closeModal(); toast('Đã hoàn trả hồ sơ về bước chấm điểm','warn'); renderAll();
  },
  twReceive(dId){
    const d = getDossier(dId);
    d.status='TW_REVIEWING';
    logH(d,'Trung ương tiếp nhận xem xét','');
    logFeed('tiếp nhận xem xét hồ sơ <b>'+d.id+'</b> tại Trung ương');
    toast('Trung ương đang xem xét — có thể thêm tiêu chí phụ ± điểm','ok');
    renderAll();
  },
  openBonusModal(dId){
    openModal('Thêm tiêu chí phụ (DU-05)',
      '<div class="t-dim mb12" style="font-size:.85rem">Trung ương cộng hoặc trừ điểm ngoài bộ tiêu chí, kèm lý do. Điểm âm để trừ.</div>'+
      '<div class="field"><label>Nội dung <span class="req">*</span></label><input class="inp" id="bn-label" placeholder="VD: Điển hình toàn quốc về khu dân cư kiểu mẫu"></div>'+
      '<div class="field"><label>Điểm cộng/trừ <span class="req">*</span></label><input class="inp" id="bn-points" type="number" step="0.5" min="-10" max="10" value="2" style="max-width:130px"></div>'+
      '<div class="field"><label>Lý do <span class="req">*</span></label><textarea class="txa" id="bn-reason" placeholder="Căn cứ quyết định, văn bản khen thưởng…"></textarea></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="App.addBonus(\''+dId+'\')">'+icon('plus',14)+' Thêm điểm phụ</button>');
  },
  addBonus(dId){
    const label = $id('bn-label').value.trim(), pts = Number($id('bn-points').value), reason = $id('bn-reason').value.trim();
    if(!label || !reason || isNaN(pts) || pts===0){ toast('Vui lòng nhập đủ nội dung, số điểm (≠0) và lý do','warn'); return; }
    const d = getDossier(dId);
    d.bonus.push({label:label, points:pts, reason:reason, by:currentUser().name});
    logH(d,'Thêm tiêu chí phụ '+(pts>0?'+':'')+pts+' điểm (DU-05)', label+' — '+reason);
    logFeed('thêm tiêu chí phụ <b>'+(pts>0?'+':'')+pts+' điểm</b> cho hồ sơ '+d.id);
    closeModal(); toast('Đã '+(pts>0?'cộng':'trừ')+' <b>'+Math.abs(pts)+' điểm</b> tiêu chí phụ — tổng điểm cập nhật','ok'); renderScreen();
  },
  removeBonus(dId, i){
    const d = getDossier(dId);
    d.bonus.splice(i,1); renderScreen();
  },
  twRequestRevision(dId){
    openModal('Yêu cầu chỉnh sửa (Trung ương)',
      '<div class="field"><label>Nội dung yêu cầu <span class="req">*</span></label>'+
      '<textarea class="txa" id="twr-reason" placeholder="VD: Đề nghị rà soát lại điểm nhóm C và bổ sung biên bản…"></textarea></div>',
      '<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-outline-danger" onclick="App.confirmTwRevision(\''+dId+'\')">'+icon('send',14)+' Gửi yêu cầu</button>');
  },
  confirmTwRevision(dId){
    const reason = $id('twr-reason').value.trim();
    if(!reason){ toast('Vui lòng nhập nội dung yêu cầu','warn'); return; }
    const d = getDossier(dId);
    d.status='REVISION_REQUESTED';
    logH(d,'Trung ương yêu cầu chỉnh sửa', reason);
    logFeed('yêu cầu chỉnh sửa hồ sơ <b>'+d.id+'</b>');
    closeModal(); toast('Đã chuyển hồ sơ về trạng thái "Yêu cầu chỉnh sửa"','warn'); renderAll();
  },
  twApprove(dId){
    const d = getDossier(dId);
    d.status='APPROVED';
    const ft = finalTotal(d);
    logH(d,'Trung ương phê duyệt kết quả','Tổng điểm cuối (gồm tiêu chí phụ): '+fmt1(ft));
    logFeed('phê duyệt hồ sơ <b>'+d.id+'</b> ('+esc(d.localityName)+') — tổng điểm '+fmt1(ft));
    toast('Đã <b>phê duyệt</b> — tổng điểm cuối '+fmt1(ft)+'. Còn một bước: Công bố (B5)','ok');
    renderAll();
  },
  publish(dId){
    const d = getDossier(dId);
    d.status='PUBLISHED';
    const ft = finalTotal(d);
    logH(d,'Công bố kết quả thi đua','Tổng điểm chính thức: '+fmt1(ft)+' — xếp hạng toàn đợt được cập nhật');
    logFeed('công bố kết quả <b>'+d.id+'</b>: '+esc(d.localityName)+' đạt <b>'+fmt1(ft)+' điểm</b>');
    const rank = publishedRank(d);
    toast('🎉 Đã <b>công bố</b>! '+esc(d.localityName)+' đạt <b>'+fmt1(ft)+' điểm</b> — hạng '+rank+' trong các đơn vị đã công bố. Xem Báo cáo → Xếp hạng.','ok');
    renderAll();
  },

  /* hồ sơ: tìm kiếm / lọc */
  hsSearch(v){ ui.hsQ=v; const tb=$id('hs-tbody'); if(tb){ tb.innerHTML=hsRows(); const c=$id('hs-count'); if(c) c.textContent=filteredDossiers().length; } },
  hsFilter(v){ ui.hsStatus=v; const tb=$id('hs-tbody'); if(tb){ tb.innerHTML=hsRows(); const c=$id('hs-count'); if(c) c.textContent=filteredDossiers().length; } },

  /* báo cáo */
  exportMock(code, fmt){
    toast('Đang kết xuất <b>'+code+'</b> định dạng '+fmt+'… Tệp <b>'+code.toLowerCase()+'-nam-2026.'+(fmt==='Excel'?'xlsx':'pdf')+'</b> đã sẵn sàng tải về (demo)','ok');
  }
};

/* đóng menu vai trò khi bấm ra ngoài */
document.addEventListener('click', e=>{
  if(!e.target.closest('.role-switch')){
    const m = document.querySelector('.role-menu.open');
    if(m) renderRoleSwitch(false);
  }
});

/* ---------- khởi động ---------- */
(function boot(){
  if(!location.hash) location.hash = '#/dashboard';
  parseHash();
  renderAll();
})();
