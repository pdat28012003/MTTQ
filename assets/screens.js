/* =====================================================================
   screens.js — các màn hình của ứng dụng
   ===================================================================== */

/* ============================ 1. TỔNG QUAN ============================ */
function screenDashboard(){
  const ds = visibleDossiers();
  const counts = {}; ds.forEach(d=>counts[d.status]=(counts[d.status]||0)+1);
  const submitted = ds.filter(d=>d.status!=='DRAFT').length;
  const grading = ds.filter(d=>['IN_REVIEW','PENDING_APPROVAL','SENT_TO_TW','TW_REVIEWING'].includes(d.status)).length;
  const published = ds.filter(d=>d.status==='PUBLISHED').length;
  const locs = ds.length;

  // top điểm: dùng total nếu có, nếu không lấy điểm kỳ trước
  const bars = flatLocalities()
    .filter(l => ds.some(d=>d.locality===l.id))
    .map(l=>{
      const d = ds.find(x=>x.locality===l.id);
      const v = (d && d.total!=null) ? finalTotal(d) : l.history[l.history.length-1];
      return { label:l.name, value:v, hl: d && d.status==='PUBLISHED', cur: d && d.total!=null };
    })
    .sort((a,b)=>b.value-a.value).slice(0,10);

  const deadlines = ds.filter(d=>['DRAFT','REVISION_REQUESTED'].includes(d.status)).map(d=>{
    const late = d.status==='REVISION_REQUESTED';
    return '<div class="dl-item '+(late?'dl-late':'dl-soon')+'">'+
      '<span class="dl-ic">'+icon(late?'warn':'clock',16)+'</span>'+
      '<div><b>'+esc(d.localityName)+'</b> · '+d.id+
      '<div class="t-dim">'+(late?'Bổ sung bằng chứng quá hạn (hạn 07/07/2026)':'Chưa nộp hồ sơ — hạn '+d.deadline)+'</div></div>'+
      '<span class="dl-d">'+(late?'Quá hạn 1 ngày':'Còn 7 ngày')+'</span></div>';
  }).join('') || '<div class="empty">'+icon('check',26,'e-ic')+'<div>Không có cảnh báo hạn nộp</div></div>';

  const feed = Store.activity.slice(0,7).map(a=>
    '<div class="feed-item">'+avatar(a.who,30)+
    '<div><div class="f-txt"><b>'+esc(a.who)+'</b> '+a.txt+'</div><div class="f-time">'+a.time+'</div></div></div>').join('');

  return pageHead('Tổng quan','Kỳ đánh giá: Năm 2026 · Bộ tiêu chí '+CRITERIA_VERSION)+
  '<div class="kpi-grid">'+
    kpi('Địa phương tham gia',locs,'trong phạm vi của bạn','k-red','map','#9B1C1C','var(--red-softer)')+
    kpi('Hồ sơ đã nộp',submitted,'trên tổng số '+locs+' hồ sơ','k-blue','doc','#1D4ED8','var(--blue-bg)')+
    kpi('Đang chấm & duyệt',grading,'ở các bước B2 → B4','k-amber','clock','#B45309','var(--amber-bg)')+
    kpi('Đã công bố',published,'kết quả chính thức đợt 1','k-gold','medal','#A8841A','var(--gold-soft)')+
  '</div>'+
  '<div class="grid-2">'+
    '<div class="card"><div class="card-head"><div><h3 class="ct">Điểm thi đua theo địa phương</h3><div class="cs">Top 10 · điểm hiện tại hoặc kỳ gần nhất · thanh vàng = đã công bố</div></div></div>'+
      '<div class="card-pad">'+hBarChart(bars)+'</div></div>'+
    '<div class="card" id="card-status-donut"><div class="card-head"><div><h3 class="ct">Trạng thái hồ sơ</h3><div class="cs">Phân bố theo 9 trạng thái nghiệp vụ</div></div></div>'+
      '<div class="card-pad">'+donutChart(counts)+'</div></div>'+
  '</div>'+
  '<div class="grid-2b">'+
    '<div class="card"><div class="card-head"><div><h3 class="ct">Hoạt động gần đây</h3><div class="cs">Nhật ký thao tác trên hệ thống</div></div></div>'+
      '<div class="card-pad feed">'+feed+'</div></div>'+
    '<div class="card"><div class="card-head"><div><h3 class="ct">Cảnh báo hạn nộp</h3><div class="cs">Theo quy định DU-08 / DU-09 · hôm nay 08/07/2026</div></div></div>'+
      '<div class="card-pad">'+deadlines+'</div></div>'+
  '</div>';
}
function kpi(label,num,sub,cls,ic,color,bg){
  return '<div class="card kpi '+cls+'"><div class="k-ic" style="background:'+bg+';color:'+color+'">'+icon(ic,19)+'</div>'+
    '<div class="k-label">'+label+'</div><div class="k-num">'+num+'</div><div class="k-sub">'+sub+'</div></div>';
}
function pageHead(title, sub, actions){
  return '<div class="page-head"><div><div class="crumb">MTQ-ERP · Thi đua – Khen thưởng</div><h1>'+title+'</h1>'+
    (sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(actions?'<div class="ph-actions">'+actions+'</div>':'')+'</div>';
}

/* ======================= 2. QUẢN LÝ NGƯỜI DÙNG ======================= */
function screenUsers(){
  return pageHead('Quản lý người dùng','QL-ND-01 → 08 · '+Store.users.length+' tài khoản',
    '<button class="btn btn-primary" onclick="App.openCreateUser()">'+icon('plus',15)+' Tạo tài khoản</button>')+
  '<div class="card">'+
    '<div class="search-bar">'+
      '<input class="inp inp-search" id="u-search" placeholder="Tìm theo tên, email, đơn vị…" oninput="App.userSearch(this.value)">'+
      '<select class="sel" onchange="App.userFilterRole(this.value)">'+
        '<option value="">Tất cả vai trò</option>'+Object.values(ROLES).map(r=>'<option value="'+r.key+'"'+(ui.userRole===r.key?' selected':'')+'>'+r.name+'</option>').join('')+
      '</select>'+
      '<select class="sel" onchange="App.userFilterStatus(this.value)">'+
        '<option value="">Tất cả trạng thái</option><option value="1"'+(ui.userStatus==='1'?' selected':'')+'>Đang hoạt động</option><option value="0"'+(ui.userStatus==='0'?' selected':'')+'>Đã vô hiệu hóa</option>'+
      '</select>'+
    '</div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+
      '<th>Người dùng</th><th>Vai trò</th><th>Đơn vị</th><th>Phạm vi phân công</th><th>Trạng thái</th><th></th>'+
    '</tr></thead><tbody id="user-tbody">'+userRows()+'</tbody></table></div>'+
  '</div>';
}
function userRows(){
  const q = (ui.userQ||'').toLowerCase();
  const rows = Store.users.filter(u=>{
    if(q && !(u.name+' '+u.email+' '+u.unit).toLowerCase().includes(q)) return false;
    if(ui.userRole && u.role!==ui.userRole) return false;
    if(ui.userStatus==='1' && !u.active) return false;
    if(ui.userStatus==='0' && u.active) return false;
    return true;
  }).map(u=>{
    const scope = u.role==='chuyenvien' ? u.assigned.length+' địa phương'
      : u.role==='diaphuong' ? (flatLocalities().find(l=>l.id===u.assigned[0])||{}).name||'—'
      : u.role==='truongphong' ? (DEPTS.find(p=>p.id===u.assigned[0])||{}).name||'—' : '—';
    return '<tr class="row-click" onclick="App.openUserDetail(\''+u.id+'\')">'+
      '<td><div class="t-user">'+avatar(u.name)+'<div><div class="t-strong">'+esc(u.name)+'</div><div class="t-dim">'+esc(u.email)+'</div></div></div></td>'+
      '<td><span class="pill'+(u.role==='admin'?' pill-red':u.role==='tw'?' pill-gold':'')+'">'+esc(u.roleName)+'</span></td>'+
      '<td>'+esc(u.unit)+'</td><td class="t-dim">'+scope+'</td>'+
      '<td>'+(u.active?'<span class="pill pill-green">● Hoạt động</span>':'<span class="pill">○ Vô hiệu hóa</span>')+'</td>'+
      '<td onclick="event.stopPropagation()"><button class="toggle'+(u.active?' on':'')+'" title="'+(u.active?'Vô hiệu hóa':'Kích hoạt')+' (QL-ND-03)" onclick="App.toggleUserActive(\''+u.id+'\')" aria-label="Bật tắt tài khoản"></button></td></tr>';
  }).join('');
  return rows || '<tr><td colspan="6"><div class="empty">'+icon('search',26,'e-ic')+'<div>Không tìm thấy người dùng phù hợp</div></div></td></tr>';
}

/* ======================= 3. QUẢN LÝ ĐỊA PHƯƠNG ======================= */
function screenLocalities(){
  const scoped = scopedLocalityIds();
  const treeHTML = LOCALITIES.map(t=>treeNode(t,scoped)).join('');
  return pageHead('Quản lý địa phương','QL-DP-01 → 07 · Cây hành chính Tỉnh → Huyện → Xã/Phường',
    (state.role==='admin' ? '<button class="btn" onclick="App.mockImport()">'+icon('upload',15)+' Import Excel</button>'+
    '<button class="btn btn-primary" onclick="App.openCreateLocality()">'+icon('plus',15)+' Thêm địa phương</button>' : ''))+
  '<div class="grid-2" style="grid-template-columns:1fr 1.25fr">'+
    '<div class="card card-pad"><div class="sec-title">Cây địa phương</div><div class="tree">'+treeHTML+'</div>'+
    (state.role==='chuyenvien'?'<div class="hint mt16" style="margin-bottom:0"><span class="h-ic">'+icon('info',17)+'</span><div class="h-txt">Bạn chỉ thao tác được với <b>các địa phương được phân công</b>; phần còn lại bị làm mờ.</div></div>':'')+
    '</div>'+
    '<div id="loc-profile">'+localityProfile()+'</div>'+
  '</div>';
}
function treeNode(n, scoped){
  const open = ui.treeOpen[n.id]!==false; // mặc định mở
  const kids = n.children ? n.children.map(c=>treeNode(c,scoped)).join('') : '';
  const isXa = n.level==='xa';
  const dimmed = isXa && scoped && !scoped.includes(n.id);
  if(scoped && !isXa && !hasScopedChild(n,scoped)) return '';
  const score = isXa ? '<span class="t-score">'+fmt1(currentScoreOf(n.id))+'</span>' : '';
  const caret = n.children ? '<span class="tw-caret'+(open?' open':'')+'" onclick="event.stopPropagation();App.toggleTree(\''+n.id+'\')">'+icon('right',13)+'</span>' : '<span class="tw-caret" style="opacity:.25">•</span>';
  const ic = n.level==='tinh'?icon('map',15):n.level==='huyen'?icon('org',15):icon('home',14);
  return '<div>'+
    '<div class="tn'+(ui.treeSel===n.id?' sel':'')+(dimmed?' dim':'')+'" onclick="App.selectTree(\''+n.id+'\')">'+caret+ic+'<span>'+esc(n.name)+'</span>'+score+'</div>'+
    (n.children && open ? '<div class="kids">'+kids+'</div>' : '')+
  '</div>';
}
function hasScopedChild(n, scoped){
  if(!n.children) return false;
  return n.children.some(c=> (c.level==='xa' && scoped.includes(c.id)) || hasScopedChild(c,scoped));
}
function localityProfile(){
  const sel = ui.treeSel && findLocality(ui.treeSel);
  if(!sel || sel.node.level!=='xa'){
    return '<div class="card card-pad"><div class="empty">'+icon('map',30,'e-ic')+'<div>Chọn một <b>xã/phường</b> trong cây để xem hồ sơ địa phương</div></div></div>';
  }
  const n = sel.node;
  /* phòng ban quản lý suy ra từ dept.localities (đồng bộ QL-PB-03; một địa phương có thể do nhiều phòng quản lý) */
  const mgDepts = DEPTS.filter(p=>(p.localities||[]).indexOf(n.id)>=0);
  const deptLabel = mgDepts.length ? mgDepts.map(p=>p.name).join(', ')
    : ((DEPTS.find(p=>p.id===n.dept)||{}).name || 'Chưa phân công');
  const d = Store.dossiers.find(x=>x.locality===n.id);
  const hist = n.history.slice(); const cur = d && d.total!=null ? finalTotal(d) : null;
  const histRows = HISTORY_YEARS.map((y,i)=>'<tr><td>'+y+'</td><td class="num t-strong">'+fmt1(n.history[i])+'</td></tr>').join('')+
    '<tr><td><b>Năm 2026</b></td><td class="num">'+(cur!=null?'<b style="color:var(--gold-dark)">'+fmt1(cur)+'</b>'+(d.status!=='PUBLISHED'?' <span class="t-dim">(tạm tính)</span>':''):'<span class="t-dim">đang đánh giá</span>')+'</td></tr>';
  return '<div class="card card-pad">'+
    '<div class="flex mb12">'+icon('home',20)+'<div><h3 style="font-size:1.15rem;font-weight:800">'+esc(n.name)+'</h3>'+
      '<div class="t-dim">'+esc(sel.path.join(' › '))+'</div></div>'+
      (d?'<span class="ml-auto">'+badge(d.status)+'</span>':'')+'</div>'+
    '<div class="grid-2b" style="margin-bottom:14px">'+
      '<div><div class="d-sec">Thông tin chung</div>'+
        info('Chủ tịch MTTQ xã', n.chairman)+info('Dân số', n.pop+' người')+
        info('Phòng ban quản lý (QL-DP-05)', deptLabel)+
        info('Hồ sơ kỳ này', d? d.id : 'Chưa khởi tạo')+'</div>'+
      '<div><div class="d-sec">Tiêu chí được gán (QL-DP-04)</div>'+
        '<div class="mb8"><span class="tag-ver">'+icon('target',13)+' Bộ tiêu chí '+CRITERIA_VERSION+'</span></div>'+
        '<div class="t-dim" style="line-height:1.7">'+CRITERIA_GROUPS.length+' nhóm · '+ALL_CRITERIA().length+' tiêu chí · tổng trọng số '+fmt1(CRITERIA_GROUPS.reduce((a,g)=>a+g.weight,0))+'%<br>Áp dụng chung toàn quốc, kỳ "Năm 2026"</div>'+
        '<div class="d-sec">Xu hướng điểm (QL-DP-06)</div>'+sparkline(cur!=null?hist.concat([cur]):hist)+'</div>'+
    '</div>'+
    '<div class="d-sec">Lịch sử điểm qua các kỳ</div>'+
    '<table class="tbl"><thead><tr><th>Kỳ đánh giá</th><th class="num">Tổng điểm</th></tr></thead><tbody>'+histRows+'</tbody></table>'+
    (d?'<div class="mt16"><button class="btn btn-sm" onclick="App.openDossier(\''+d.id+'\')">'+icon('doc',14)+' Mở hồ sơ '+d.id+'</button></div>':'')+
  '</div>';
}
function info(k,v){ return '<div style="margin-bottom:9px"><div class="t-dim" style="font-size:.74rem">'+k+'</div><div class="t-strong">'+esc(v)+'</div></div>'; }

/* ======================= 4. QUẢN LÝ PHÒNG BAN ======================= */
function screenDepartments(){
  const canCreate = state.role==='admin';
  const cards = DEPTS.map(p=>{
    const prog = deptProgress(p);
    const total = prog.done+prog.doing+prog.notyet+prog.late;
    const pct = total? Math.round(prog.done/total*100) : 0;
    const mem = p.members.map(id=>{const u=Store.users.find(x=>x.id===id);return u?avatar(u.name,30):'';}).join('');
    const canMng = canManageDept(p);
    const own = state.role==='truongphong' && p.id===myDeptId();
    const off = p.active===false;
    return '<div class="card dept-card'+(off?' dept-off':'')+(own?'" style="border-color:#E4B7AF;box-shadow:0 0 0 3px rgba(155,28,28,.07)':'')+'">'+
      '<div class="dc-top"><div class="dc-ic">'+icon('org',20)+'</div>'+
        '<div style="flex:1"><h4>'+esc(p.name)+' <span class="pill" style="text-transform:none;letter-spacing:0">'+esc(p.code||'—')+'</span>'+
          (own?' <span class="pill pill-red">Phòng của bạn</span>':'')+(off?' <span class="pill">○ Ngừng hoạt động</span>':'')+'</h4>'+
        '<div class="dc-sub">Trưởng phòng: '+esc(p.head)+'</div>'+
        (p.desc?'<div class="t-dim" style="font-size:.8rem;margin-top:3px">'+esc(p.desc)+'</div>':'')+'</div></div>'+
      '<div class="flex"><div class="dc-members">'+(mem||'<span class="t-dim">Chưa có thành viên</span>')+'</div>'+
        '<span class="ml-auto pill">'+p.members.length+' thành viên</span><span class="pill">'+p.localities.length+' địa phương</span></div>'+
      '<div><div class="flex" style="justify-content:space-between;font-size:.78rem;margin-bottom:6px"><span class="t-dim">Tiến độ chấm điểm (QL-PB-05)</span><b>'+pct+'%</b></div>'+
      '<div class="prog">'+
        (total?'<span class="p-done" style="width:'+(prog.done/total*100)+'%"></span><span class="p-doing" style="width:'+(prog.doing/total*100)+'%"></span><span class="p-late" style="width:'+(prog.late/total*100)+'%"></span>':'')+
      '</div>'+
      '<div class="leg"><span><i style="background:var(--green)"></i>Đã chấm '+prog.done+'</span><span><i style="background:var(--gold)"></i>Đang chấm '+prog.doing+'</span><span><i style="background:#D6CCBC"></i>Chưa chấm '+prog.notyet+'</span><span><i style="background:var(--red-strong)"></i>Quá hạn '+prog.late+'</span></div></div>'+
      '<div class="flex"><button class="btn btn-sm" onclick="App.deptDetail(\''+p.id+'\')">'+icon('eye',14)+' Chi tiết & quản lý</button>'+
      (canMng?'<button class="btn btn-sm btn-ghost" onclick="App.openEditDept(\''+p.id+'\')">'+icon('edit',14)+' Sửa</button>'+
        '<button class="btn btn-sm btn-ghost" onclick="App.toggleDeptActive(\''+p.id+'\')" title="QL-PB-06">'+icon(off?'check':'lock',14)+' '+(off?'Kích hoạt':'Vô hiệu')+'</button>':'')+'</div>'+
    '</div>';
  }).join('');
  return pageHead('Quản lý phòng ban','QL-PB-01 → 06 · '+DEPTS.length+' phòng ban chuyên môn',
    canCreate?'<button class="btn btn-primary" onclick="App.openCreateDept()">'+icon('plus',15)+' Tạo phòng ban</button>':'')+
  '<div class="grid-2b">'+cards+'</div>';
}

/* ====================== 5. TIÊU CHÍ THI ĐUA ====================== */
function screenCriteria(){
  const sum = CRITERIA_GROUPS.reduce((a,g)=>a+g.weight,0);
  const canEdit = ['admin','tw'].includes(state.role);
  const groups = CRITERIA_GROUPS.map(g=>{
    const open = ui.cgOpen[g.id]!==false;
    const isum = groupItemsWeight(g);
    const subsumCls = isum===g.weight ? 'ok' : 'bad';
    const items = g.items.map(it=>{
      const subsHTML = (it.subs && it.subs.length)
        ? '<div class="c-subs">Chỉ số con: '+it.subs.map(s=>esc(subLabel(s))+' <span class="t-dim">('+subScale(s,it.scale)+'đ)</span>').join(' · ')+'</div>'
        : '<div class="c-subs t-dim">Chưa có chỉ số con</div>';
      return '<div class="crit-row"><div class="c-code">'+it.id+'</div>'+
        '<div style="flex:1">'+
          '<div class="c-name">'+esc(it.name)+'</div>'+
          (it.desc?'<div class="c-desc">'+esc(it.desc)+'</div>':'')+
          subsHTML+
          '<div class="c-meta"><span class="pill">Thang điểm '+it.scale+'</span>'+
          it.evidence.map(e=>'<span class="pill">'+icon('file',11)+' '+esc(e)+'</span>').join('')+'</div>'+
          (canEdit?'<div class="crit-actions">'+
            '<button class="icon-btn" title="Sửa tiêu chí (QL-TC-02)" onclick="App.openEditCrit(\''+it.id+'\')">'+icon('edit',14)+'</button>'+
            '<button class="icon-btn" title="Quản lý chỉ số con (QL-TC-03)" onclick="App.openSubs(\''+it.id+'\')">'+icon('list',14)+'</button>'+
            '<button class="icon-btn danger" title="Xóa tiêu chí" onclick="App.deleteCrit(\''+it.id+'\')">'+icon('trash',14)+'</button>'+
          '</div>':'')+
        '</div>'+
        '<div class="c-w"><b>'+it.weight+'%</b><div class="t-dim" style="font-size:.72rem">trọng số</div></div>'+
      '</div>';
    }).join('') || '<div class="crit-row"><div class="t-dim" style="font-size:.85rem;padding:2px 0">Nhóm chưa có tiêu chí. Bấm <b>+</b> ở đầu nhóm để thêm.</div></div>';
    return '<div class="cg'+(open?' open':'')+'"><div class="cg-head">'+
      '<div class="g-tag" onclick="App.toggleGroup(\''+g.id+'\')" style="cursor:pointer">'+g.id+'</div>'+
      '<div onclick="App.toggleGroup(\''+g.id+'\')" style="cursor:pointer">'+
        '<h4>Nhóm '+g.id+' — '+esc(g.name)+'</h4>'+
        (g.desc?'<div class="t-dim" style="font-size:.76rem">'+esc(g.desc)+'</div>':'')+
        '<div class="t-dim" style="font-size:.76rem">'+g.items.length+' tiêu chí</div></div>'+
      '<span class="g-subsum '+subsumCls+'" title="Tổng trọng số các tiêu chí con so với trọng số nhóm">Σ '+fmt1(isum)+'% / '+g.weight+'%</span>'+
      '<span class="g-w">'+g.weight+'%</span>'+
      (canEdit?'<span class="g-actions">'+
        '<button class="icon-btn" title="Thêm tiêu chí vào nhóm (QL-TC-02)" onclick="event.stopPropagation();App.openCreateCrit(\''+g.id+'\')">'+icon('plus',14)+'</button>'+
        '<button class="icon-btn" title="Sửa nhóm (QL-TC-01)" onclick="event.stopPropagation();App.openEditGroup(\''+g.id+'\')">'+icon('edit',14)+'</button>'+
        '<button class="icon-btn danger" title="Xóa nhóm" onclick="event.stopPropagation();App.deleteGroup(\''+g.id+'\')">'+icon('trash',14)+'</button>'+
      '</span>':'')+
      '<span class="tw-caret'+(open?' open':'')+'" onclick="App.toggleGroup(\''+g.id+'\')" style="cursor:pointer">'+icon('right',15)+'</span></div>'+
      (open?items:'')+'</div>';
  }).join('');
  return pageHead('Quản lý tiêu chí thi đua','QL-TC-01 → 08 · Phân cấp: Nhóm tiêu chí → Tiêu chí → Chỉ số con',
    '<span class="tag-ver" style="align-self:center">'+icon('target',13)+' Phiên bản '+CRITERIA_VERSION+'</span>'+
    (canEdit?'<button class="btn" onclick="App.mockExportCriteria()">'+icon('export',15)+' Xuất Excel</button>'+
      '<button class="btn" onclick="App.mockImportCriteria()">'+icon('upload',15)+' Nhập Excel</button>'+
      '<button class="btn btn-primary" onclick="App.openCreateGroup()">'+icon('plus',15)+' Tạo nhóm tiêu chí</button>':''))+
  '<div class="wsum'+(sum===100?'':' bad')+'">'+icon(sum===100?'check':'warn',17)+'<b>Tổng trọng số nhóm: '+fmt1(sum)+'%</b><div class="ws-bar"><i style="width:'+Math.min(sum,100)+'%"></i></div>'+
    '<span class="pill '+(sum===100?'pill-green':'pill-red')+'">'+(sum===100?'Hợp lệ — đủ 100%':'Chưa đủ 100% (QL-TC-01)')+'</span></div>'+
  (canEdit?'<div class="hint" style="margin-top:0"><span class="h-ic">'+icon('info',17)+'</span><div class="h-txt">Bạn có quyền biên tập bộ tiêu chí. Theo <b>QL-TC-04</b>, bộ tiêu chí được phiên bản hóa theo chu kỳ — mọi thay đổi tại đây áp dụng cho bộ <b>'+CRITERIA_VERSION+'</b>.</div></div>':'')+
  '<div class="grid-2" style="grid-template-columns:1.5fr 1fr">'+
    '<div>'+groups+'</div>'+
    '<div class="card card-pad" id="sim-panel" style="position:sticky;top:80px">'+
      '<div class="sec-title">Mô phỏng tổng điểm (QL-TC-07)</div>'+
      '<div class="t-dim mb12" style="font-size:.8rem">Kéo thanh trượt để thử điểm từng tiêu chí và xem tổng điểm có trọng số cập nhật trực tiếp.</div>'+
      ALL_CRITERIA().map(it=>{
        const v = ui.sim[it.id]!=null?ui.sim[it.id]:80;
        return '<div class="sim-row"><span><b>'+it.id+'</b> <span class="t-dim">('+it.weight+'%)</span></span>'+
        '<input type="range" min="0" max="100" value="'+v+'" oninput="App.simSet(\''+it.id+'\',this.value)">'+
        '<span class="sim-val" id="sim-'+it.id+'">'+v+' đ</span></div>';
      }).join('')+
      '<div class="sim-total"><div class="st-num" id="sim-total">'+fmt1(simTotal())+'</div><div class="st-lbl">Tổng điểm có trọng số / 100</div></div>'+
    '</div>'+
  '</div>';
}
function simTotal(){
  let t=0; ALL_CRITERIA().forEach(it=>{ const v=ui.sim[it.id]!=null?ui.sim[it.id]:80; t+=v*it.weight/100; });
  return t;
}

/* ---- helper cho CRUD tiêu chí ---- */
function evChecks(selected){
  selected = selected||[];
  return '<div class="ev-checks">'+EVIDENCE_TYPES.map(e=>{
    const on = selected.indexOf(e)>=0;
    return '<label class="ev-check'+(on?' on':'')+'"><input type="checkbox" value="'+esc(e)+'"'+(on?' checked':'')+
      ' onchange="this.closest(\'.ev-check\').classList.toggle(\'on\',this.checked)"> '+esc(e)+'</label>';
  }).join('')+'</div>';
}
function readEvChecks(){ return Array.from(document.querySelectorAll('.ev-checks input:checked')).map(i=>i.value); }
function scaleSelect(id, val){
  val = val||100;
  return '<select class="sel" id="'+id+'"><option value="10"'+(val==10?' selected':'')+'>0 – 10 điểm</option>'+
    '<option value="100"'+(val==100?' selected':'')+'>0 – 100 điểm</option></select>';
}
function subEditorHTML(){
  if(!ui.subEdit || !ui.subEdit.length) return '<div class="sub-empty">Chưa có chỉ số con nào. Bấm “Thêm chỉ số con”.</div>';
  return '<div class="sub-list">'+ui.subEdit.map((s,i)=>
    '<div class="sub-item">'+
      '<input class="inp sub-name" placeholder="Tên chỉ số con (VD: Số cuộc vận động triển khai)" value="'+esc(s.name||'')+'">'+
      '<select class="sel sub-scale"><option value="10"'+(s.scale==10?' selected':'')+'>0–10 đ</option>'+
        '<option value="100"'+(s.scale==100||!s.scale?' selected':'')+'>0–100 đ</option></select>'+
      '<button class="icon-btn danger" title="Xóa chỉ số con" onclick="App.removeSubRow('+i+')">'+icon('trash',13)+'</button>'+
    '</div>').join('')+'</div>';
}

/* ======================= 6. HỒ SƠ THI ĐUA ======================= */
function screenDossiers(){
  if(ui.dossierId) return dossierDetail(getDossier(ui.dossierId));
  const live = visibleDossiers().find(d=>d.liveDemo);
  return pageHead('Hồ sơ thi đua','Kỳ "Năm 2026" · '+visibleDossiers().length+' hồ sơ trong phạm vi của bạn')+
  (live?'<div class="hint">'+
    '<span class="h-ic">'+icon('star',18)+'</span>'+
    '<div class="h-txt"><b>Kịch bản demo:</b> hồ sơ <b>'+live.id+' — '+esc(live.localityName)+'</b> có thể đi trọn <b>luồng duyệt 5 bước</b>. Hãy đổi vai trò lần lượt: Đại diện địa phương → Chuyên viên → Trưởng phòng → Trung ương để đưa hồ sơ từ "Bản nháp" đến "Đã công bố".</div>'+
    '<button class="btn btn-primary btn-sm" onclick="App.openDossier(\''+live.id+'\')">'+icon('right',13)+' Bắt đầu</button></div>':'')+
  '<div class="card">'+
    '<div class="search-bar">'+
      '<input class="inp inp-search" placeholder="Tìm mã hồ sơ, địa phương…" oninput="App.hsSearch(this.value)">'+
      '<select class="sel" onchange="App.hsFilter(this.value)"><option value="">Tất cả trạng thái</option>'+
        Object.keys(STATUS).map(k=>'<option value="'+k+'"'+(ui.hsStatus===k?' selected':'')+'>'+STATUS[k].label+'</option>').join('')+'</select>'+
      '<span class="ml-auto t-dim" style="font-size:.8rem"><span id="hs-count">'+filteredDossiers().length+'</span> hồ sơ</span>'+
    '</div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+
      '<th>Mã hồ sơ</th><th>Địa phương</th><th>Trạng thái</th><th class="num">Tổng điểm</th><th>Hạn nộp</th><th>Cập nhật cuối</th><th></th>'+
    '</tr></thead><tbody id="hs-tbody">'+hsRows()+'</tbody></table></div></div>';
}
function filteredDossiers(){
  return visibleDossiers().filter(d=>{
    if(ui.hsStatus && d.status!==ui.hsStatus) return false;
    const q=(ui.hsQ||'').toLowerCase();
    if(q && !(d.id+' '+d.localityName+' '+d.district).toLowerCase().includes(q)) return false;
    return true;
  });
}
function hsRows(){
  return filteredDossiers().map(d=>{
    return '<tr class="row-click" id="hs-row-'+d.id+'" onclick="App.openDossier(\''+d.id+'\')">'+
      '<td><span class="t-strong mono">'+d.id+'</span>'+(d.liveDemo?' <span class="pill pill-gold" style="margin-left:5px">'+icon('star',10)+' Demo tương tác</span>':'')+'</td>'+
      '<td><div class="t-strong">'+esc(d.localityName)+'</div><div class="t-dim">'+esc(d.district)+'</div></td>'+
      '<td>'+badge(d.status)+'</td>'+
      '<td class="num">'+(d.total!=null?'<b>'+fmt1(finalTotal(d))+'</b>':'<span class="t-dim">—</span>')+'</td>'+
      '<td class="t-dim">'+d.deadline+'</td>'+
      '<td class="t-dim">'+(d.history[d.history.length-1]||{}).time+'</td>'+
      '<td><button class="btn btn-sm">'+icon('right',13)+' Mở</button></td></tr>';
  }).join('') || '<tr><td colspan="7"><div class="empty">'+icon('doc',28,'e-ic')+'<div>Không có hồ sơ trong phạm vi/bộ lọc hiện tại</div></div></td></tr>';
}

/* ---------- chi tiết hồ sơ + luồng 5 bước ---------- */
const STEPS = [
  {n:'B1', name:'Địa phương nộp bằng chứng', actor:'Đại diện địa phương'},
  {n:'B2', name:'Chuyên viên chấm điểm', actor:'Chuyên viên phòng ban'},
  {n:'B3', name:'Trưởng phòng duyệt', actor:'Trưởng phòng ban'},
  {n:'B4', name:'Trung ương phê duyệt', actor:'Trung ương (+ tiêu chí phụ)'},
  {n:'B5', name:'Công bố kết quả', actor:'Hệ thống / Trung ương'}
];
function stepIndex(st){
  return {DRAFT:0, REVISION_REQUESTED:0, SUBMITTED:1, IN_REVIEW:1, PENDING_APPROVAL:2, SENT_TO_TW:3, TW_REVIEWING:3, APPROVED:4, PUBLISHED:5}[st];
}
function dossierDetail(d){
  if(!d) return '<div class="empty">Không tìm thấy hồ sơ</div>';
  const idx = stepIndex(d.status);
  const stepsHTML = STEPS.map((s,i)=>{
    let cls = i<idx?'done':i===idx?'cur':'';
    if(d.status==='REVISION_REQUESTED' && i===0) cls='warn cur';
    if(d.status==='PUBLISHED') cls='done';
    return '<div class="step '+cls+'"><div class="s-dot">'+(i<idx||d.status==='PUBLISHED'?icon('check',15):s.n)+'</div><div class="s-line"></div>'+
      '<div class="s-name">'+s.n+' · '+s.name+'</div><div class="s-actor">'+s.actor+'</div></div>';
  }).join('');

  const tl = d.history.slice().reverse().map((h,i)=>
    '<div class="tl-item'+(i===0?' tl-hl':'')+'"><span class="tl-dot"></span>'+
    '<div class="tl-t">'+h.time+' · '+esc(h.role)+'</div><div class="tl-a">'+esc(h.actor)+' — '+esc(h.action)+'</div>'+
    (h.note?'<div class="tl-n">'+esc(h.note)+'</div>':'')+
    '<div class="mt8">'+badge(h.status)+'</div></div>').join('');

  const evTotal = Object.values(d.evidence).reduce((a,b)=>a+b.length,0);

  return '<div class="page-head"><div>'+
    '<button class="btn btn-ghost btn-sm mb8" onclick="App.backToList()">'+icon('back',14)+' Danh sách hồ sơ</button>'+
    '<h1 style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'+d.id+' '+badge(d.status)+'</h1>'+
    '<div class="sub">'+esc(d.localityName)+' · '+esc(d.district)+' · Kỳ "Năm 2026" · Hạn nộp '+d.deadline+'</div></div>'+
    '<div class="ph-actions">'+dossierActionButtons(d)+'</div></div>'+
    workflowHint(d)+
  '<div class="card mb16"><div class="stepper">'+stepsHTML+'</div></div>'+
  '<div class="grid-dossier">'+
    '<div>'+criteriaPanel(d)+bonusPanel(d)+'</div>'+
    '<div>'+
      '<div class="card card-pad mb16"><div class="sec-title">Tổng hợp điểm</div><div id="score-summary">'+scoreSummary(d)+'</div></div>'+
      '<div class="card card-pad mb16"><div class="sec-title">Bằng chứng ('+evTotal+' tệp)</div>'+evidenceSummary(d)+'</div>'+
      '<div class="card card-pad"><div class="sec-title">Lịch sử trạng thái (DU-07)</div><div class="timeline">'+tl+'</div></div>'+
    '</div>'+
  '</div>';
}

/* gợi ý bước tiếp theo của luồng demo */
function workflowHint(d){
  const map = {
    DRAFT:{role:'diaphuong', txt:'Địa phương cần <b>đính kèm bằng chứng</b> cho các tiêu chí, tự đánh giá rồi nhấn <b>“Nộp hồ sơ”</b> (DU-01).'},
    REVISION_REQUESTED:{role:'diaphuong', txt:'Hồ sơ bị <b>yêu cầu chỉnh sửa</b>. Địa phương bổ sung bằng chứng theo ghi chú rồi <b>nộp lại hồ sơ</b>.'},
    SUBMITTED:{role:'chuyenvien', txt:'Chuyên viên <b>tiếp nhận và bắt đầu chấm điểm</b> (DU-02) — nhập điểm từng tiêu chí, tổng có trọng số tự tính.'},
    IN_REVIEW:{role:'chuyenvien', txt:'Nhập đủ <b>'+ALL_CRITERIA().length+' điểm tiêu chí</b> và <b>nhận xét bắt buộc</b>, sau đó nhấn <b>“Gửi trưởng phòng”</b>. Có thể dùng nút điền điểm gợi ý.'},
    PENDING_APPROVAL:{role:'truongphong', txt:'Trưởng phòng xem lại kết quả chấm, <b>có thể điều chỉnh điểm từng tiêu chí</b>, rồi <b>“Duyệt & gửi Trung ương”</b> (DU-04) hoặc <b>“Hoàn trả”</b> kèm lý do (DU-06).'},
    SENT_TO_TW:{role:'tw', txt:'Trung ương nhấn <b>“Tiếp nhận xem xét”</b> để chuyển sang trạng thái TW đang xem xét.'},
    TW_REVIEWING:{role:'tw', txt:'Trung ương <b>so sánh điểm giữa các địa phương</b> (xem Báo cáo → Xếp hạng), có thể thêm <b>tiêu chí phụ ± điểm</b> (DU-05), sau đó <b>“Phê duyệt”</b> hoặc <b>“Yêu cầu chỉnh sửa”</b>.'},
    APPROVED:{role:'tw', txt:'Kết quả đã phê duyệt. Nhấn <b>“Công bố kết quả”</b> để hoàn tất bước B5 — bảng xếp hạng sẽ cập nhật.'},
    PUBLISHED:{role:null, txt:'Hồ sơ đã <b>công bố</b>. Xem vị trí của địa phương trong <b>Báo cáo → Bảng xếp hạng thi đua</b>.'}
  };
  const m = map[d.status]; if(!m) return '';
  const needSwitch = m.role && state.role!==m.role && state.role!=='admin';
  return '<div class="hint"><span class="h-ic">'+icon(d.status==='PUBLISHED'?'medal':'info',18)+'</span>'+
    '<div class="h-txt">'+m.txt+(needSwitch?' — Bạn đang ở vai khác, hãy chuyển sang vai <b>'+ROLES[m.role].name+'</b>.':'')+'</div>'+
    (needSwitch?'<button class="btn btn-sm btn-gold" onclick="App.switchRole(\''+m.role+'\')">'+icon('swap',13)+' Chuyển vai '+ROLES[m.role].name+'</button>':'')+
    (d.status==='TW_REVIEWING'?'<button class="btn btn-sm btn-ghost" onclick="App.nav(\'baocao\')">'+icon('cmp',13)+' Xem so sánh xếp hạng</button>':'')+
    (d.status==='PUBLISHED'?'<button class="btn btn-sm btn-gold" onclick="App.nav(\'baocao\')">'+icon('rank',13)+' Xem xếp hạng</button>':'')+
  '</div>';
}

/* các nút hành động theo vai trò × trạng thái */
function dossierActionButtons(d){
  const r = state.role, s = d.status, isAdmin = r==='admin';
  const B=[];
  const editable = (r==='diaphuong'||isAdmin) && (s==='DRAFT'||s==='REVISION_REQUESTED');
  if(editable){
    B.push('<button class="btn" onclick="App.quickFillEvidence(\''+d.id+'\')">'+icon('upload',15)+' Đính kèm nhanh bộ mẫu</button>');
    B.push('<button class="btn btn-primary" onclick="App.submitDossier(\''+d.id+'\')">'+icon('send',15)+' '+(s==='REVISION_REQUESTED'?'Nộp lại hồ sơ':'Nộp hồ sơ')+'</button>');
  }
  if((r==='chuyenvien'||isAdmin) && s==='SUBMITTED')
    B.push('<button class="btn btn-primary" onclick="App.startReview(\''+d.id+'\')">'+icon('edit',15)+' Bắt đầu chấm điểm</button>');
  if((r==='chuyenvien'||isAdmin) && s==='IN_REVIEW'){
    B.push('<button class="btn" onclick="App.requestEvidence(\''+d.id+'\')">'+icon('warn',15)+' Yêu cầu bổ sung bằng chứng</button>');
    B.push('<button class="btn btn-primary" onclick="App.sendToHead(\''+d.id+'\')">'+icon('send',15)+' Gửi trưởng phòng</button>');
  }
  if((r==='truongphong'||isAdmin) && s==='PENDING_APPROVAL'){
    B.push('<button class="btn btn-outline-danger" onclick="App.returnDossier(\''+d.id+'\')">'+icon('back',15)+' Hoàn trả</button>');
    B.push('<button class="btn btn-primary" onclick="App.approveSend(\''+d.id+'\')">'+icon('send',15)+' Duyệt & gửi Trung ương</button>');
  }
  if((r==='tw'||isAdmin) && s==='SENT_TO_TW')
    B.push('<button class="btn btn-primary" onclick="App.twReceive(\''+d.id+'\')">'+icon('eye',15)+' Tiếp nhận xem xét</button>');
  if((r==='tw'||isAdmin) && s==='TW_REVIEWING'){
    B.push('<button class="btn" onclick="App.openBonusModal(\''+d.id+'\')">'+icon('plus',15)+' Thêm tiêu chí phụ</button>');
    B.push('<button class="btn btn-outline-danger" onclick="App.twRequestRevision(\''+d.id+'\')">'+icon('back',15)+' Yêu cầu chỉnh sửa</button>');
    B.push('<button class="btn btn-green" onclick="App.twApprove(\''+d.id+'\')">'+icon('check',15)+' Phê duyệt</button>');
  }
  if((r==='tw'||isAdmin) && s==='APPROVED')
    B.push('<button class="btn btn-gold" onclick="App.publish(\''+d.id+'\')">'+icon('medal',15)+' Công bố kết quả</button>');
  if(!B.length && r==='viewer') B.push('<span class="pill">'+icon('lock',12)+' Chỉ xem</span>');
  return B.join('');
}

/* bảng tiêu chí trong hồ sơ: bằng chứng + tự đánh giá + chấm điểm */
function criteriaPanel(d){
  const r = state.role, s = d.status;
  const canEvidence = (r==='diaphuong'||r==='admin') && (s==='DRAFT'||s==='REVISION_REQUESTED');
  const canScore = ((r==='chuyenvien'||r==='admin') && s==='IN_REVIEW') || ((r==='truongphong'||r==='admin') && s==='PENDING_APPROVAL');
  const canComment = (r==='chuyenvien'||r==='admin') && s==='IN_REVIEW';
  const headAdjust = (r==='truongphong'||r==='admin') && s==='PENDING_APPROVAL';

  let html = '<div class="card mb16" id="dossier-criteria"><div class="card-head"><div><h3 class="ct">Tiêu chí & bằng chứng</h3>'+
    '<div class="cs">Bộ tiêu chí '+CRITERIA_VERSION+' · '+(canScore?(headAdjust?'Trưởng phòng có thể điều chỉnh điểm (bước 18)':'Nhập điểm 0–100 cho từng tiêu chí'):ALL_CRITERIA().length+' tiêu chí, '+CRITERIA_GROUPS.length+' nhóm')+'</div></div>'+
    (canScore?'<button class="btn btn-sm ml-auto" style="align-self:flex-start" onclick="App.fillSampleScores(\''+d.id+'\')">'+icon('star',13)+' Điền điểm gợi ý</button>':'')+
    '</div><div class="card-pad" style="padding-top:12px">';

  CRITERIA_GROUPS.forEach(g=>{
    html += '<div class="sec-title mt12">Nhóm '+g.id+' — '+esc(g.name)+' <span class="pill pill-gold" style="text-transform:none;letter-spacing:0">'+g.weight+'%</span></div>';
    g.items.forEach(it=>{
      const ev = d.evidence[it.id]||[];
      const sc = d.scores[it.id];
      const checked = d.selfCheck[it.id];
      html += '<div class="crit-row" style="padding-left:2px;padding-right:2px">'+
        '<div class="c-code">'+it.id+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="c-name">'+esc(it.name)+' <span class="t-dim" style="font-weight:500">· trọng số '+it.weight+'%</span></div>'+
          '<div class="chips mt8">'+
            ev.map((f,i)=>'<span class="chip">'+fileIcon(f.type)+' '+esc(f.name)+(canEvidence?'<button class="cx" title="Gỡ tệp" onclick="App.removeEvidence(\''+d.id+'\',\''+it.id+'\','+i+')">✕</button>':'')+'</span>').join('')+
            (canEvidence?'<button class="chip chip-add" onclick="App.addEvidence(\''+d.id+'\',\''+it.id+'\')">'+icon('plus',11)+' Bằng chứng</button>':'')+
            (!ev.length&&!canEvidence?'<span class="t-dim" style="font-size:.76rem">Chưa có bằng chứng</span>':'')+
          '</div>'+
          (canEvidence?'<label class="flex mt8" style="gap:7px;font-size:.8rem;cursor:pointer;color:var(--ink-soft)"><input type="checkbox" '+(checked?'checked':'')+' onchange="App.toggleSelfCheck(\''+d.id+'\',\''+it.id+'\')" style="accent-color:var(--red);width:15px;height:15px"> Tự đánh giá: đạt yêu cầu tiêu chí</label>'
            :(checked?'<div class="t-dim mt8" style="font-size:.76rem">'+icon('check',11)+' Địa phương tự đánh giá: đạt</div>':''))+
          (sc && sc.note && !canScore?'<div class="t-dim mt8" style="font-size:.79rem;font-style:italic">Nhận xét: '+esc(sc.note)+'</div>':'')+
        '</div>'+
        '<div class="c-w" style="min-width:88px">'+
          (canScore
            ?'<input type="number" min="0" max="100" class="inp score-inp" placeholder="—" value="'+(sc?sc.score:'')+'" oninput="App.setScore(\''+d.id+'\',\''+it.id+'\',this.value)"><div class="t-dim" style="font-size:.7rem;margin-top:3px">/ '+it.scale+' điểm</div>'
            :(sc!=null && sc.score!=null?'<b style="font-size:1.1rem">'+sc.score+'</b><div class="t-dim" style="font-size:.7rem">/ '+it.scale+'</div>':'<span class="t-dim">—</span>'))+
        '</div></div>';
    });
  });

  if(canComment){
    html += '<div class="field mt16"><label>Nhận xét tổng hợp của chuyên viên <span class="req">*</span> (bắt buộc trước khi gửi trưởng phòng)</label>'+
      '<textarea class="txa" placeholder="VD: Hồ sơ đầy đủ, bằng chứng rõ ràng…" oninput="App.setReviewComment(\''+d.id+'\',this.value)">'+esc(d.reviewComment)+'</textarea></div>'+
      '<div class="field"><label>Đề xuất khen thưởng / kỷ luật (tùy chọn — bước 16)</label>'+
      '<textarea class="txa" placeholder="VD: Đề nghị tặng Bằng khen cho tập thể xã…" oninput="App.setRewardProposal(\''+d.id+'\',this.value)">'+esc(d.rewardProposal||'')+'</textarea></div>';
  } else {
    if(d.reviewComment)
      html += '<div class="hint mt16" style="margin-bottom:0"><span class="h-ic">'+icon('edit',16)+'</span><div class="h-txt"><b>Nhận xét của chuyên viên:</b> '+esc(d.reviewComment)+'</div></div>';
    if(d.rewardProposal)
      html += '<div class="hint mt8" style="margin-bottom:0"><span class="h-ic">'+icon('medal',16)+'</span><div class="h-txt"><b>Đề xuất khen thưởng / kỷ luật:</b> '+esc(d.rewardProposal)+'</div></div>';
  }
  html += '</div></div>';
  return html;
}

/* tiêu chí phụ (DU-05) */
function bonusPanel(d){
  const canEdit = (state.role==='tw'||state.role==='admin') && d.status==='TW_REVIEWING';
  if(!d.bonus.length && !canEdit) return '';
  const rows = d.bonus.map((b,i)=>
    '<tr><td><div class="t-strong">'+esc(b.label)+'</div><div class="t-dim">'+esc(b.reason)+' · '+esc(b.by)+'</div></td>'+
    '<td class="num"><b style="color:'+(b.points>=0?'var(--green)':'var(--red-strong)')+'">'+(b.points>=0?'+':'')+b.points+'</b></td>'+
    (canEdit?'<td><button class="btn btn-sm btn-ghost" onclick="App.removeBonus(\''+d.id+'\','+i+')">✕</button></td>':'<td></td>')+'</tr>').join('');
  return '<div class="card mb16"><div class="card-head"><div><h3 class="ct">Tiêu chí phụ của Trung ương (DU-05)</h3>'+
    '<div class="cs">Điểm cộng / trừ kèm lý do, do Trung ương quyết định</div></div>'+
    (canEdit?'<button class="btn btn-sm ml-auto" style="align-self:flex-start" onclick="App.openBonusModal(\''+d.id+'\')">'+icon('plus',13)+' Thêm</button>':'')+'</div>'+
    '<div class="card-pad" style="padding-top:10px">'+
    (d.bonus.length?'<table class="tbl"><thead><tr><th>Nội dung</th><th class="num">Điểm</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>'
      :'<div class="t-dim" style="font-size:.85rem">Chưa có tiêu chí phụ. Nhấn "Thêm" để cộng/trừ điểm kèm lý do.</div>')+
    '</div></div>';
}

/* tổng hợp điểm bên phải */
function scoreSummary(d){
  const total = weightedTotal(d);
  const bonusSum = d.bonus.reduce((a,b)=>a+b.points,0);
  const nScored = Object.keys(d.scores).filter(k=>d.scores[k]&&d.scores[k].score!=null&&d.scores[k].score!=='').length;
  const groups = CRITERIA_GROUPS.map(g=>{
    let gs=0, gw=0, has=false;
    g.items.forEach(it=>{ const sc=d.scores[it.id]; if(sc&&sc.score!=null&&sc.score!==''){ gs+=sc.score*it.weight/100; has=true;} gw+=it.weight; });
    return '<div class="flex" style="justify-content:space-between;font-size:.83rem;padding:5px 0;border-bottom:1px dashed #F0EADF">'+
      '<span>Nhóm '+g.id+' <span class="t-dim">('+gw+'%)</span></span><b class="mono">'+(has?fmt1(gs):'—')+'</b></div>';
  }).join('');
  return groups+
    '<div class="flex" style="justify-content:space-between;font-size:.83rem;padding:7px 0">'+
      '<span>Tiêu chí phụ (TW)</span><b class="mono" style="color:'+(bonusSum>=0?'var(--green)':'var(--red-strong)')+'">'+(bonusSum?(bonusSum>0?'+':'')+bonusSum:'0')+'</b></div>'+
    '<div class="total-box mt8"><span class="tb-num" id="live-total">'+(nScored?fmt1(total+bonusSum):'—')+'</span>'+
      '<span class="t-dim">/ 100 điểm · <span id="live-scored">'+nScored+'</span>/'+ALL_CRITERIA().length+' tiêu chí đã chấm</span></div>'+
    (d.status==='PUBLISHED'?'<div class="pill pill-gold mt12">'+icon('medal',13)+' Đã công bố chính thức — hạng '+publishedRank(d)+' toàn đợt</div>':'');
}

/* tổng hợp bằng chứng */
function evidenceSummary(d){
  const all=[]; Object.keys(d.evidence).forEach(k=>d.evidence[k].forEach(f=>all.push({crit:k,f:f})));
  if(!all.length) return '<div class="t-dim" style="font-size:.85rem">Chưa có tệp nào được tải lên.</div>';
  return '<div class="chips">'+all.map(x=>'<span class="chip" title="Tiêu chí '+x.crit+'">'+fileIcon(x.f.type)+' '+esc(x.f.name)+'<span class="t-dim" style="font-size:.68rem">·'+x.crit+'</span></span>').join('')+'</div>';
}

/* ====================== 7. BÁO CÁO & THỐNG KÊ ====================== */
function screenReports(){
  const cards = REPORTS.map(r=>
    '<div class="card rep-card"><span class="rc-code">'+r.code+'</span>'+
    '<div class="rc-ic" style="background:'+r.color+'18;color:'+r.color+'">'+icon(r.icon,20)+'</div>'+
    '<h4>'+esc(r.name)+'</h4><div class="rc-desc">'+esc(r.desc)+'<br><span style="font-size:.72rem">Đối tượng: '+esc(r.aud)+'</span></div>'+
    '<div class="rep-actions">'+
      '<button class="btn btn-sm" onclick="App.exportMock(\''+r.code+'\',\'Excel\')">'+icon('export',13)+' Excel</button>'+
      '<button class="btn btn-sm" onclick="App.exportMock(\''+r.code+'\',\'PDF\')">'+icon('file',13)+' PDF</button>'+
      (r.featured?'<span class="pill pill-gold ml-auto">Xem bên dưới ↓</span>':'')+
    '</div></div>').join('');

  // BC-02 — xếp hạng
  const ranked = Store.dossiers.filter(d=>d.total!=null)
    .map(d=>{ const l=flatLocalities().find(x=>x.id===d.locality);
      return {d:d, name:d.localityName, cur:finalTotal(d), prev:l.history[3], official:d.status==='PUBLISHED'}; })
    .sort((a,b)=>b.cur-a.cur);
  const rankRows = ranked.map((r,i)=>{
    const delta = round1(r.cur - r.prev);
    const dHtml = delta>0?'<span class="delta-up">▲ +'+fmt1(delta)+'</span>':delta<0?'<span class="delta-dn">▼ '+fmt1(delta)+'</span>':'<span class="delta-eq">—</span>';
    const medal = i===0?'<span class="rank-medal rm-1">1</span>':i===1?'<span class="rank-medal rm-2">2</span>':i===2?'<span class="rank-medal rm-3">3</span>':'<span class="rank-medal rm-n">'+(i+1)+'</span>';
    return '<tr'+(r.official?'':' style="opacity:.65"')+'><td>'+medal+'</td>'+
      '<td><div class="t-strong">'+esc(r.name)+'</div><div class="t-dim">'+esc(r.d.district)+'</div></td>'+
      '<td class="num"><b style="font-size:1.05rem">'+fmt1(r.cur)+'</b></td>'+
      '<td class="num">'+fmt1(r.prev)+'</td><td>'+dHtml+'</td>'+
      '<td>'+(r.official?'<span class="pill pill-green">'+icon('check',11)+' Chính thức</span>':'<span class="pill">Tạm tính</span>')+'</td></tr>';
  }).join('') || '<tr><td colspan="6"><div class="empty">Chưa có địa phương nào được chấm điểm</div></td></tr>';

  // BC-06 — so sánh 2 kỳ
  const cmpItems = ranked.slice(0,6).map(r=>({label:r.name, prev:r.prev, cur:r.cur}));

  return pageHead('Báo cáo & thống kê','BC-01 → 09 · Kết xuất Excel / PDF (demo)')+
  '<div class="rep-grid">'+cards+'</div>'+
  '<div class="grid-2" style="grid-template-columns:1.25fr 1fr">'+
    '<div class="card" id="bc02-card"><div class="card-head"><div><h3 class="ct">'+icon('rank',16)+' BC-02 · Bảng xếp hạng thi đua — Năm 2026</h3>'+
      '<div class="cs">Sắp theo tổng điểm cuối (gồm tiêu chí phụ) · so với kỳ Năm 2025</div></div>'+
      '<button class="btn btn-sm ml-auto" style="align-self:flex-start" onclick="App.exportMock(\'BC-02\',\'Excel\')">'+icon('export',13)+' Xuất Excel</button></div>'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Hạng</th><th>Địa phương</th><th class="num">Năm 2026</th><th class="num">Năm 2025</th><th>Biến động</th><th>Tình trạng</th></tr></thead>'+
      '<tbody>'+rankRows+'</tbody></table></div></div>'+
    '<div class="card"><div class="card-head"><div><h3 class="ct">'+icon('cmp',16)+' BC-06 · So sánh giữa hai kỳ</h3>'+
      '<div class="cs">Top 6 địa phương có điểm kỳ này</div></div></div>'+
      '<div class="card-pad">'+(cmpItems.length?compareChart(cmpItems):'<div class="empty">Chưa đủ dữ liệu so sánh</div>')+'</div></div>'+
  '</div>';
}

/* ========================= 8. PHÂN QUYỀN ========================= */
function screenPermissions(){
  const roleKeys = ['admin','tw','truongphong','chuyenvien','diaphuong','viewer'];
  const cell = v => v==='f'?'<span class="mx-full" title="Toàn quyền">✓</span>'
    : v==='m'?'<span class="mx-mng" title="Quản lý / thao tác">QUẢN LÝ</span>'
    : v==='v'?'<span class="mx-view" title="Chỉ xem">XEM</span>'
    : '<span class="mx-no">—</span>';
  const head = '<tr><th>Chức năng</th>'+roleKeys.map(k=>'<th class="'+(state.role===k?'hl':'')+'">'+ROLES[k].name.replace(' (Viewer)','')+'</th>').join('')+'</tr>';
  const rows = PERM_MATRIX.map(r=>{
    if(r.group) return '<tr class="mx-group"><td colspan="7">'+esc(r.group)+'</td></tr>';
    return '<tr><td>'+esc(r.fn)+'</td>'+roleKeys.map(k=>'<td class="'+(state.role===k?'hl':'')+'">'+cell(r[k])+'</td>').join('')+'</tr>';
  }).join('');
  return pageHead('Ma trận phân quyền','PQ-01 → 07 · Cột được tô đậm là vai trò bạn đang dùng')+
  '<div class="hint"><span class="h-ic">'+icon('shield',18)+'</span>'+
    '<div class="h-txt"><b>PQ-05:</b> Vai trò <b>Admin Hệ thống</b> không bị giới hạn bởi ma trận này — Admin luôn có toàn quyền trên mọi chức năng. Thử <b>đổi vai trò</b> ở góc phải trên để thấy cột tô đậm và menu trái thay đổi theo.</div></div>'+
  '<div class="card card-pad mx-wrap" id="perm-matrix"><table class="mx"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table>'+
  '<div class="leg mt12"><span><b class="mx-full">✓</b>&nbsp;Toàn quyền</span><span><b class="mx-mng">QUẢN LÝ</b>&nbsp;Thao tác trong phạm vi</span><span><b class="mx-view">XEM</b>&nbsp;Chỉ xem</span><span><b class="mx-no">—</b>&nbsp;Không truy cập</span></div></div>';
}
