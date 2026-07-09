/* =====================================================================
   MTQ-ERP · Demo Module Đánh giá Thi đua Địa phương
   data.js — dữ liệu mẫu (mock), cấu hình vai trò, trạng thái, phân quyền
   ===================================================================== */

/* ---------- 9 trạng thái hồ sơ ---------- */
const STATUS = {
  DRAFT:              { label: 'Bản nháp',                 short: 'Nháp' },
  SUBMITTED:          { label: 'Đã nộp',                   short: 'Đã nộp' },
  IN_REVIEW:          { label: 'Đang chấm điểm',           short: 'Đang chấm' },
  PENDING_APPROVAL:   { label: 'Chờ trưởng phòng duyệt',   short: 'Chờ duyệt' },
  SENT_TO_TW:         { label: 'Đã gửi Trung ương',        short: 'Gửi TW' },
  TW_REVIEWING:       { label: 'TW đang xem xét',          short: 'TW xem xét' },
  REVISION_REQUESTED: { label: 'Yêu cầu chỉnh sửa',        short: 'Cần sửa' },
  APPROVED:           { label: 'Đã phê duyệt',             short: 'Phê duyệt' },
  PUBLISHED:          { label: 'Đã công bố',               short: 'Công bố' }
};

/* ---------- 6 vai trò (RBAC) ---------- */
const ROLES = {
  admin: {
    key: 'admin', name: 'Admin Hệ thống', userId: 'u01',
    desc: 'Toàn quyền quản trị — không bị giới hạn bởi ma trận phân quyền (PQ-05).',
    banner: 'Bạn có <b>toàn quyền hệ thống</b>: quản lý người dùng, địa phương, phòng ban, tiêu chí, can thiệp mọi hồ sơ và xem mọi báo cáo.',
    color: '#7F1414'
  },
  tw: {
    key: 'tw', name: 'Trung ương', userId: 'u02',
    desc: 'Xem toàn bộ điểm, thêm tiêu chí phụ, phê duyệt cuối, công bố, xuất báo cáo.',
    banner: 'Vai trò <b>Trung ương</b>: xem điểm của tất cả địa phương, thêm <b>tiêu chí phụ (±điểm)</b>, phê duyệt cuối cùng, công bố kết quả và xuất báo cáo tổng hợp.',
    color: '#9B1C1C'
  },
  truongphong: {
    key: 'truongphong', name: 'Trưởng phòng ban', userId: 'u03',
    desc: 'Quản lý phòng mình, duyệt điểm chuyên viên, gửi Trung ương hoặc hoàn trả.',
    banner: 'Vai trò <b>Trưởng phòng ban</b> (Phòng Phong trào): quản lý chuyên viên và địa phương của phòng, <b>duyệt điểm</b> do chuyên viên chấm, gửi hồ sơ lên Trung ương hoặc hoàn trả để chấm lại.',
    color: '#B45309'
  },
  chuyenvien: {
    key: 'chuyenvien', name: 'Chuyên viên phòng ban', userId: 'u04',
    desc: 'Chấm điểm các địa phương được phân công, xem xét bằng chứng.',
    banner: 'Vai trò <b>Chuyên viên</b> (Phòng Phong trào): chỉ thấy <b>4 địa phương được phân công</b>, xem xét bằng chứng, chấm điểm theo tiêu chí và gửi trưởng phòng duyệt.',
    color: '#1D4ED8'
  },
  diaphuong: {
    key: 'diaphuong', name: 'Đại diện địa phương', userId: 'u07',
    desc: 'Tải bằng chứng, tự đánh giá và nộp hồ sơ của địa phương mình.',
    banner: 'Vai trò <b>Đại diện địa phương</b> (Xã Kim Liên, H. Nam Đàn): tải lên <b>bằng chứng</b> theo từng tiêu chí, tự đánh giá và <b>nộp hồ sơ</b> đúng hạn. Chỉ thấy hồ sơ của địa phương mình.',
    color: '#0F766E'
  },
  viewer: {
    key: 'viewer', name: 'Người xem (Viewer)', userId: 'u09',
    desc: 'Chỉ xem báo cáo, không thao tác.',
    banner: 'Vai trò <b>Người xem</b>: chỉ được <b>xem báo cáo & thống kê</b> đã công bố. Mọi nút thao tác đều bị ẩn.',
    color: '#6B7280'
  }
};

/* ---------- Người dùng (QL-ND) ---------- */
const USERS = [
  { id:'u01', name:'Phạm Quốc Việt',    role:'admin',       roleName:'Admin Hệ thống',        unit:'Văn phòng UBTƯ MTTQ VN',        email:'viet.pq@mttq.vn',   active:true,  assigned:[], logins:[['08/07/2026 07:52','Đăng nhập thành công','118.70.12.4'],['07/07/2026 16:40','Đăng nhập thành công','118.70.12.4'],['05/07/2026 08:03','Đăng nhập thành công','113.161.8.21']] },
  { id:'u02', name:'Lê Thị Thanh Hằng', role:'tw',          roleName:'Trung ương',            unit:'Ban Thi đua – Khen thưởng TƯ',  email:'hang.ltt@mttq.vn',  active:true,  assigned:[], logins:[['08/07/2026 08:15','Đăng nhập thành công','118.70.33.9'],['06/07/2026 14:22','Đăng nhập thành công','118.70.33.9']] },
  { id:'u03', name:'Trần Văn Bình',     role:'truongphong', roleName:'Trưởng phòng ban',      unit:'Phòng Phong trào',              email:'binh.tv@mttq.vn',   active:true,  assigned:['pb1'], logins:[['08/07/2026 07:58','Đăng nhập thành công','203.113.5.77'],['07/07/2026 09:31','Đăng nhập thành công','203.113.5.77']] },
  { id:'u04', name:'Nguyễn Văn Hùng',   role:'chuyenvien',  roleName:'Chuyên viên phòng ban', unit:'Phòng Phong trào',              email:'hung.nv@mttq.vn',   active:true,  assigned:['kimlien','namgiang','namcat','dason'], logins:[['08/07/2026 08:01','Đăng nhập thành công','203.113.5.80'],['07/07/2026 08:12','Đăng nhập thành công','203.113.5.80'],['04/07/2026 13:45','Sai mật khẩu (1 lần)','203.113.5.80']] },
  { id:'u05', name:'Đỗ Thị Minh Châu',  role:'chuyenvien',  roleName:'Chuyên viên phòng ban', unit:'Phòng Tuyên giáo',              email:'chau.dtm@mttq.vn',  active:true,  assigned:['tungAnh','lamtrungthuy','xuangiang'], logins:[['07/07/2026 10:18','Đăng nhập thành công','113.161.44.6']] },
  { id:'u06', name:'Hoàng Đức Long',    role:'truongphong', roleName:'Trưởng phòng ban',      unit:'Phòng Tuyên giáo',              email:'long.hd@mttq.vn',   active:true,  assigned:['pb2'], logins:[['06/07/2026 15:50','Đăng nhập thành công','113.161.44.10']] },
  { id:'u07', name:'Trần Thị Mai',      role:'diaphuong',   roleName:'Đại diện địa phương',   unit:'Xã Kim Liên, H. Nam Đàn',       email:'mai.tt@nghean.gov.vn', active:true, assigned:['kimlien'], logins:[['08/07/2026 08:30','Đăng nhập thành công','171.224.9.15'],['05/07/2026 20:11','Đăng nhập thành công','171.224.9.15']] },
  { id:'u08', name:'Võ Minh Tuấn',      role:'diaphuong',   roleName:'Đại diện địa phương',   unit:'Xã Tùng Ảnh, H. Đức Thọ',       email:'tuan.vm@hatinh.gov.vn', active:true, assigned:['tungAnh'], logins:[['07/07/2026 21:02','Đăng nhập thành công','14.232.7.90']] },
  { id:'u09', name:'Bùi Thu Trang',     role:'viewer',      roleName:'Người xem (Viewer)',    unit:'HĐND tỉnh Nghệ An',             email:'trang.bt@nghean.gov.vn', active:true, assigned:[], logins:[['06/07/2026 09:44','Đăng nhập thành công','171.224.30.2']] },
  { id:'u10', name:'Ngô Văn Sáu',       role:'chuyenvien',  roleName:'Chuyên viên phòng ban', unit:'Phòng Tổ chức',                 email:'sau.nv@mttq.vn',    active:false, assigned:['tiendien','codam'], logins:[['12/06/2026 10:05','Đăng nhập thành công','203.113.5.92'],['15/06/2026 08:20','Tài khoản bị vô hiệu hóa bởi Admin','—']] }
];

/* ---------- Cây địa phương (QL-DP): Tỉnh → Huyện → Xã ---------- */
const LOCALITIES = [
  { id:'nghean', name:'Tỉnh Nghệ An', level:'tinh', children:[
    { id:'namdan', name:'Huyện Nam Đàn', level:'huyen', children:[
      { id:'kimlien',  name:'Xã Kim Liên',      level:'xa', chairman:'Trần Thị Mai',    pop:'12.400', dept:'pb1', history:[76.2, 79.5, 81.0, 84.3] },
      { id:'namgiang', name:'Xã Nam Giang',     level:'xa', chairman:'Phan Văn Đức',    pop:'9.100',  dept:'pb1', history:[71.4, 70.8, 74.9, 77.2] },
      { id:'namcat',   name:'Xã Nam Cát',       level:'xa', chairman:'Lê Thị Hoa',      pop:'7.800',  dept:'pb1', history:[68.0, 72.3, 75.6, 79.8] }
    ]},
    { id:'doluong', name:'Huyện Đô Lương', level:'huyen', children:[
      { id:'dason',    name:'Xã Đà Sơn',        level:'xa', chairman:'Nguyễn Hữu Thắng',pop:'8.600',  dept:'pb1', history:[74.1, 76.0, 78.4, 80.9] },
      { id:'ttdoluong',name:'Thị trấn Đô Lương',level:'xa', chairman:'Cao Thị Ngân',    pop:'15.200', dept:'pb1', history:[80.2, 82.7, 83.1, 84.0] }
    ]}
  ]},
  { id:'hatinh', name:'Tỉnh Hà Tĩnh', level:'tinh', children:[
    { id:'ducthọ', name:'Huyện Đức Thọ', level:'huyen', children:[
      { id:'tungAnh',      name:'Xã Tùng Ảnh',        level:'xa', chairman:'Võ Minh Tuấn',  pop:'10.300', dept:'pb2', history:[82.5, 84.1, 86.0, 87.4] },
      { id:'lamtrungthuy', name:'Xã Lâm Trung Thủy',  level:'xa', chairman:'Đặng Thị Lan', pop:'11.700', dept:'pb2', history:[69.9, 71.2, 73.0, 75.5] }
    ]},
    { id:'nghixuan', name:'Huyện Nghi Xuân', level:'huyen', children:[
      { id:'xuangiang', name:'Xã Xuân Giang', level:'xa', chairman:'Hồ Sỹ Quang',   pop:'9.900',  dept:'pb2', history:[77.7, 80.1, 82.8, 85.0] },
      { id:'tiendien',  name:'Xã Tiên Điền',  level:'xa', chairman:'Nguyễn Du Khánh',pop:'6.400', dept:'pb3', history:[85.3, 87.0, 88.9, 90.1] },
      { id:'codam',     name:'Xã Cổ Đạm',     level:'xa', chairman:'Trịnh Văn Lâm', pop:'8.150',  dept:'pb3', history:[70.0, 72.5, 74.8, 76.9] }
    ]}
  ]}
];
const HISTORY_YEARS = ['Năm 2022','Năm 2023','Năm 2024','Năm 2025'];

/* ---------- Phòng ban (QL-PB) ---------- */
const DEPTS = [
  { id:'pb1', name:'Phòng Phong trào', code:'PB-PT', desc:'Phụ trách các phong trào thi đua, cuộc vận động ở cơ sở và Quỹ “Vì người nghèo”.',
    head:'Trần Văn Bình', members:['u03','u04'], positions:{u03:'Trưởng phòng', u04:'Chuyên viên'},
    localities:['kimlien','namgiang','namcat','dason','ttdoluong'], active:true,
    workflow:['Chuyên viên chấm điểm','Trưởng phòng ban duyệt'] },
  { id:'pb2', name:'Phòng Tuyên giáo', code:'PB-TG', desc:'Phụ trách công tác tuyên truyền, vận động và định hướng dư luận xã hội.',
    head:'Hoàng Đức Long', members:['u06','u05'], positions:{u06:'Trưởng phòng', u05:'Chuyên viên'},
    localities:['tungAnh','lamtrungthuy','xuangiang'], active:true,
    workflow:['Chuyên viên chấm điểm','Phó phòng rà soát','Trưởng phòng ban duyệt'] },
  { id:'pb3', name:'Phòng Tổ chức', code:'PB-TC', desc:'Phụ trách xây dựng tổ chức, cán bộ Mặt trận các cấp.',
    head:'Lê Văn Kiên', members:['u10'], positions:{u10:'Chuyên viên'},
    localities:['tiendien','codam'], active:true,
    workflow:['Chuyên viên chấm điểm','Trưởng phòng ban duyệt'] },
  { id:'pb4', name:'Phòng Dân chủ – Pháp luật', code:'PB-DCPL', desc:'Phụ trách giám sát, phản biện xã hội và công tác pháp luật.',
    head:'Phạm Thị Yến', members:[], positions:{},
    localities:[], active:false,
    workflow:['Chuyên viên chấm điểm','Trưởng phòng ban duyệt'] }
];
function findDept(id){ return DEPTS.find(p=>p.id===id) || null; }
function nextDeptId(){ let n=DEPTS.length+1; while(DEPTS.some(p=>p.id==='pb'+n)) n++; return 'pb'+n; }
/* ngày hôm nay của demo, để tính "quá hạn" (QL-PB-05) */
const TODAY_DEMO = new Date(2026,6,8);
function parseVNDate(s){ const m=/(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s||''); return m?new Date(+m[3],+m[2]-1,+m[1]):null; }
/* tiến độ chấm điểm tính động theo hồ sơ của các địa phương phòng phụ trách */
function deptProgress(p){
  const doneSt=['APPROVED','PUBLISHED'], doingSt=['IN_REVIEW','PENDING_APPROVAL','SENT_TO_TW','TW_REVIEWING'];
  const r={done:0,doing:0,notyet:0,late:0};
  (p.localities||[]).forEach(lid=>{
    const d=DOSSIERS.find(x=>x.locality===lid);
    if(!d){ r.notyet++; return; }
    if(doneSt.indexOf(d.status)>=0){ r.done++; return; }
    const dl=parseVNDate(d.deadline);
    if(dl && dl<TODAY_DEMO){ r.late++; }
    else if(doingSt.indexOf(d.status)>=0){ r.doing++; }
    else r.notyet++;
  });
  return r;
}

/* ---------- Bộ tiêu chí thi đua (QL-TC) · phiên bản v2.1 — Năm 2026 ---------- */
const CRITERIA_VERSION = 'v2.1 — Năm 2026';
const CRITERIA_GROUPS = [
  { id:'A', name:'Công tác tuyên truyền, vận động', weight:30, items:[
    { id:'A1', name:'Tuyên truyền chủ trương của Đảng, chính sách pháp luật của Nhà nước', weight:15, scale:100,
      subs:['Số hội nghị, buổi tuyên truyền tổ chức trong kỳ','Tỷ lệ hộ dân được tiếp cận thông tin (%)','Số tin, bài trên hệ thống truyền thanh cơ sở'],
      evidence:['Báo cáo','Hình ảnh'] },
    { id:'A2', name:'Vận động nhân dân tham gia phong trào tại cộng đồng dân cư', weight:15, scale:100,
      subs:['Số cuộc vận động triển khai','Số lượt người dân tham gia','Mô hình tiêu biểu được nhân rộng'],
      evidence:['Báo cáo','Video'] }
  ]},
  { id:'B', name:'Phong trào thi đua, cuộc vận động', weight:30, items:[
    { id:'B1', name:'Cuộc vận động “Toàn dân đoàn kết xây dựng nông thôn mới, đô thị văn minh”', weight:12, scale:100,
      subs:['Số khu dân cư đạt danh hiệu văn hóa','Tỷ lệ hộ gia đình đạt chuẩn văn hóa (%)'],
      evidence:['Báo cáo','Hình ảnh'] },
    { id:'B2', name:'Phong trào thi đua “Đoàn kết sáng tạo, nâng cao năng suất”', weight:10, scale:100,
      subs:['Số sáng kiến, mô hình mới','Số tập thể, cá nhân được biểu dương'],
      evidence:['Báo cáo'] },
    { id:'B3', name:'Vận động Quỹ “Vì người nghèo” và an sinh xã hội', weight:8, scale:100,
      subs:['Tổng số tiền vận động (triệu đồng)','Số nhà Đại đoàn kết được hỗ trợ xây mới, sửa chữa'],
      evidence:['Báo cáo','Chứng từ'] }
  ]},
  { id:'C', name:'Giám sát, phản biện xã hội', weight:25, items:[
    { id:'C1', name:'Giám sát việc thực hiện chính sách, pháp luật tại địa phương', weight:13, scale:100,
      subs:['Số cuộc giám sát chuyên đề','Số kiến nghị sau giám sát được tiếp thu, xử lý'],
      evidence:['Báo cáo','Biên bản'] },
    { id:'C2', name:'Phản biện xã hội đối với dự thảo chính sách, đề án', weight:12, scale:100,
      subs:['Số hội nghị phản biện tổ chức','Số văn bản góp ý được cơ quan soạn thảo tiếp thu'],
      evidence:['Báo cáo','Biên bản'] }
  ]},
  { id:'D', name:'Xây dựng tổ chức', weight:15, items:[
    { id:'D1', name:'Phát triển tổ chức thành viên, Ban công tác Mặt trận khu dân cư', weight:8, scale:100,
      subs:['Số Ban công tác Mặt trận hoạt động tốt','Tỷ lệ khu dân cư có tổ chức Mặt trận vững mạnh (%)'],
      evidence:['Báo cáo'] },
    { id:'D2', name:'Bồi dưỡng, tập huấn cán bộ Mặt trận cơ sở', weight:7, scale:100,
      subs:['Số lớp tập huấn tổ chức','Số lượt cán bộ được bồi dưỡng'],
      evidence:['Báo cáo','Hình ảnh'] }
  ]}
];
function ALL_CRITERIA(){ const out=[]; CRITERIA_GROUPS.forEach(g=>g.items.forEach(it=>out.push(Object.assign({group:g.id, groupName:g.name}, it)))); return out; }

/* ---- danh mục loại bằng chứng (QL-TC-02) ---- */
const EVIDENCE_TYPES = ['Báo cáo','Tài liệu','Hình ảnh','Video','Số liệu','Biên bản','Chứng từ'];

/* ---- helper cho CRUD tiêu chí ---- */
/* chỉ số con có thể là chuỗi (dữ liệu cũ) hoặc đối tượng {name, scale} — QL-TC-03 */
function subLabel(s){ return typeof s==='string' ? s : ((s && s.name) || ''); }
function subScale(s, parentScale){ return (s && typeof s==='object' && s.scale) ? s.scale : parentScale; }
function findGroup(gid){ return CRITERIA_GROUPS.find(g=>g.id===gid) || null; }
function findCrit(cid){ for(const g of CRITERIA_GROUPS){ const i=g.items.findIndex(x=>x.id===cid); if(i>=0) return {group:g, item:g.items[i], idx:i}; } return null; }
function nextCritId(gid){ const g=findGroup(gid); let n=(g?g.items.length:0)+1; while(g && g.items.some(x=>x.id===gid+n)) n++; return gid+n; }
function nextGroupId(){ let c=65; while(CRITERIA_GROUPS.some(g=>g.id===String.fromCharCode(c))) c++; return String.fromCharCode(c); }
function groupItemsWeight(g){ return g.items.reduce((a,it)=>a+(Number(it.weight)||0),0); }

/* danh sách id mọi xã/phường trong cây địa phương */
function allXaIds(){ const out=[]; (function walk(ns){ ns.forEach(n=>{ if(n.level==='xa') out.push(n.id); if(n.children) walk(n.children); }); })(LOCALITIES); return out; }
/* QL-TC-05: gán địa phương vào tiêu chí — seed mặc định: mọi tiêu chí áp dụng cho mọi xã hiện có */
(function seedCritLocalities(){
  const xa = allXaIds();
  CRITERIA_GROUPS.forEach(g=>g.items.forEach(it=>{ if(!it.localities) it.localities = xa.slice(); }));
})();

/* ---------- Hồ sơ thi đua (kỳ Năm 2026) ---------- */
/* Bằng chứng mẫu tái sử dụng */
function EV(name, type){ return { name:name, type:type }; } // type: pdf | img | video | xls

const DOSSIERS = [
  { id:'HS-2026-001', locality:'kimlien', localityName:'Xã Kim Liên', district:'H. Nam Đàn, Nghệ An', dept:'pb1',
    status:'DRAFT', deadline:'15/07/2026', total:null, bonus:[], liveDemo:true,
    selfCheck:{}, evidence:{ A1:[EV('bao-cao-tuyen-truyen-6thang.pdf','pdf')] },
    scores:{}, reviewComment:'',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ kỳ "Năm 2026"', status:'DRAFT', note:'Hạn nộp: 15/07/2026' }
    ] },

  { id:'HS-2026-002', locality:'namgiang', localityName:'Xã Nam Giang', district:'H. Nam Đàn, Nghệ An', dept:'pb1',
    status:'SUBMITTED', deadline:'15/07/2026', total:null, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-namgiang.pdf','pdf'),EV('hinh-hoi-nghi-kdc.jpg','img')], B1:[EV('bc-ntm-2026.pdf','pdf')], B3:[EV('chung-tu-quy-vnn.pdf','pdf')], C1:[EV('bien-ban-giam-sat.pdf','pdf')], D2:[EV('hinh-lop-tap-huan.jpg','img')] },
    scores:{}, reviewComment:'',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'05/07/2026 15:42', actor:'Phan Văn Đức', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'Đính kèm 6 bằng chứng, hoàn tất tự đánh giá' }
    ] },

  { id:'HS-2026-003', locality:'namcat', localityName:'Xã Nam Cát', district:'H. Nam Đàn, Nghệ An', dept:'pb1',
    status:'IN_REVIEW', deadline:'15/07/2026', total:null, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-namcat.pdf','pdf')], A2:[EV('video-ra-quan-moi-truong.mp4','video')], B1:[EV('bc-khu-dan-cu-van-hoa.pdf','pdf')], C2:[EV('bien-ban-hoi-nghi-pb.pdf','pdf')] },
    scores:{ A1:{score:82, note:'Đủ số buổi tuyên truyền'}, A2:{score:78, note:''}, B1:{score:85, note:''} }, reviewComment:'',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'04/07/2026 10:20', actor:'Lê Thị Hoa', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'06/07/2026 08:35', actor:'Nguyễn Văn Hùng', role:'Chuyên viên', action:'Bắt đầu chấm điểm', status:'IN_REVIEW', note:'Đã chấm 3/9 tiêu chí' }
    ] },

  { id:'HS-2026-004', locality:'dason', localityName:'Xã Đà Sơn', district:'H. Đô Lương, Nghệ An', dept:'pb1',
    status:'PENDING_APPROVAL', deadline:'15/07/2026', total:81.9, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-dason.pdf','pdf'),EV('hinh-panô-tuyen-truyen.jpg','img')], B2:[EV('bc-sang-kien.pdf','pdf')], B3:[EV('chung-tu-ung-ho.pdf','pdf')], C1:[EV('bb-giam-sat-datdai.pdf','pdf')], D1:[EV('bc-to-chuc.pdf','pdf')] },
    scores:{ A1:{score:84,note:'Vượt chỉ tiêu hội nghị'}, A2:{score:80,note:''}, B1:{score:83,note:''}, B2:{score:79,note:''}, B3:{score:88,note:'Quỹ vượt 12%'}, C1:{score:81,note:''}, C2:{score:78,note:''}, D1:{score:85,note:''}, D2:{score:82,note:''} },
    reviewComment:'Hồ sơ đầy đủ, bằng chứng rõ ràng. Đề nghị trưởng phòng phê duyệt.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'03/07/2026 14:05', actor:'Nguyễn Hữu Thắng', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'04/07/2026 09:12', actor:'Nguyễn Văn Hùng', role:'Chuyên viên', action:'Bắt đầu chấm điểm', status:'IN_REVIEW', note:'' },
      { time:'06/07/2026 16:48', actor:'Nguyễn Văn Hùng', role:'Chuyên viên', action:'Hoàn tất chấm điểm, gửi trưởng phòng', status:'PENDING_APPROVAL', note:'Tổng điểm sơ bộ: 81.9' }
    ] },

  { id:'HS-2026-005', locality:'ttdoluong', localityName:'Thị trấn Đô Lương', district:'H. Đô Lương, Nghệ An', dept:'pb1',
    status:'SENT_TO_TW', deadline:'15/07/2026', total:85.2, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-tt.pdf','pdf')], A2:[EV('video-ngay-hoi-ddk.mp4','video')], B1:[EV('bc-do-thi-van-minh.pdf','pdf')], C1:[EV('bb-giam-sat-xdcb.pdf','pdf')], C2:[EV('bb-phan-bien-quyhoach.pdf','pdf')] },
    scores:{ A1:{score:86,note:''}, A2:{score:88,note:''}, B1:{score:84,note:''}, B2:{score:82,note:''}, B3:{score:85,note:''}, C1:{score:86,note:''}, C2:{score:83,note:''}, D1:{score:87,note:''}, D2:{score:84,note:''} },
    reviewComment:'Đơn vị dẫn đầu cụm Đô Lương, phong trào đồng đều.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'02/07/2026 10:44', actor:'Cao Thị Ngân', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'03/07/2026 08:30', actor:'Nguyễn Văn Hùng', role:'Chuyên viên', action:'Bắt đầu chấm điểm', status:'IN_REVIEW', note:'' },
      { time:'05/07/2026 11:20', actor:'Nguyễn Văn Hùng', role:'Chuyên viên', action:'Gửi trưởng phòng duyệt', status:'PENDING_APPROVAL', note:'Tổng điểm: 85.2' },
      { time:'07/07/2026 09:02', actor:'Trần Văn Bình', role:'Trưởng phòng', action:'Duyệt và gửi Trung ương', status:'SENT_TO_TW', note:'Nhất trí với kết quả chấm của chuyên viên' }
    ] },

  { id:'HS-2026-006', locality:'tungAnh', localityName:'Xã Tùng Ảnh', district:'H. Đức Thọ, Hà Tĩnh', dept:'pb2',
    status:'TW_REVIEWING', deadline:'15/07/2026', total:88.3,
    bonus:[ {label:'Điển hình toàn quốc về khu dân cư kiểu mẫu', points:+2, reason:'Được Trung ương biểu dương tại Hội nghị toàn quốc 6/2026', by:'Lê Thị Thanh Hằng'} ],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-ta.pdf','pdf')], B1:[EV('bc-kdc-kieu-mau.pdf','pdf'),EV('hinh-kdc-kieu-mau.jpg','img')], B3:[EV('chung-tu-quy.pdf','pdf')], C1:[EV('bb-giam-sat.pdf','pdf')], D1:[EV('bc-to-chuc-ta.pdf','pdf')] },
    scores:{ A1:{score:90,note:''}, A2:{score:87,note:''}, B1:{score:92,note:'Khu dân cư kiểu mẫu tiêu biểu'}, B2:{score:85,note:''}, B3:{score:89,note:''}, C1:{score:88,note:''}, C2:{score:86,note:''}, D1:{score:90,note:''}, D2:{score:88,note:''} },
    reviewComment:'Đơn vị xuất sắc của Hà Tĩnh, hồ sơ mẫu mực.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'02/07/2026 08:15', actor:'Võ Minh Tuấn', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'03/07/2026 09:40', actor:'Đỗ Thị Minh Châu', role:'Chuyên viên', action:'Bắt đầu chấm điểm', status:'IN_REVIEW', note:'' },
      { time:'04/07/2026 17:25', actor:'Đỗ Thị Minh Châu', role:'Chuyên viên', action:'Gửi trưởng phòng duyệt', status:'PENDING_APPROVAL', note:'Tổng điểm: 88.3' },
      { time:'05/07/2026 10:10', actor:'Hoàng Đức Long', role:'Trưởng phòng', action:'Duyệt và gửi Trung ương', status:'SENT_TO_TW', note:'' },
      { time:'06/07/2026 14:30', actor:'Lê Thị Thanh Hằng', role:'Trung ương', action:'Tiếp nhận xem xét, thêm tiêu chí phụ +2', status:'TW_REVIEWING', note:'Cộng 2 điểm: điển hình toàn quốc' }
    ] },

  { id:'HS-2026-007', locality:'lamtrungthuy', localityName:'Xã Lâm Trung Thủy', district:'H. Đức Thọ, Hà Tĩnh', dept:'pb2',
    status:'REVISION_REQUESTED', deadline:'15/07/2026', total:null, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,C1:1},
    evidence:{ A1:[EV('bc-tuyen-truyen-ltt.pdf','pdf')], B1:[EV('bc-ntm-ltt.pdf','pdf')] },
    scores:{}, reviewComment:'',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'03/07/2026 16:55', actor:'Đặng Thị Lan', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'05/07/2026 09:20', actor:'Đỗ Thị Minh Châu', role:'Chuyên viên', action:'Yêu cầu bổ sung bằng chứng', status:'REVISION_REQUESTED', note:'Thiếu chứng từ Quỹ "Vì người nghèo" (B3) và biên bản giám sát (C1)' }
    ] },

  { id:'HS-2026-008', locality:'xuangiang', localityName:'Xã Xuân Giang', district:'H. Nghi Xuân, Hà Tĩnh', dept:'pb2',
    status:'APPROVED', deadline:'15/07/2026', total:87.5,
    bonus:[ {label:'Trừ điểm: nộp bổ sung bằng chứng trễ hạn', points:-1, reason:'Bổ sung chứng từ sau hạn 3 ngày', by:'Lê Thị Thanh Hằng'} ],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-xg-tuyentruyen.pdf','pdf')], A2:[EV('hinh-hoat-dong.jpg','img')], B1:[EV('bc-ntm-xg.pdf','pdf')], C2:[EV('bb-pb-de-an.pdf','pdf')] },
    scores:{ A1:{score:88,note:''}, A2:{score:86,note:''}, B1:{score:87,note:''}, B2:{score:84,note:''}, B3:{score:90,note:''}, C1:{score:89,note:''}, C2:{score:88,note:''}, D1:{score:89,note:''}, D2:{score:87,note:''} },
    reviewComment:'Kết quả tốt, đồng đều các mặt công tác.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'02/07/2026 11:30', actor:'Hồ Sỹ Quang', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'03/07/2026 13:50', actor:'Đỗ Thị Minh Châu', role:'Chuyên viên', action:'Chấm điểm xong, gửi trưởng phòng', status:'PENDING_APPROVAL', note:'Tổng: 87.5' },
      { time:'04/07/2026 08:45', actor:'Hoàng Đức Long', role:'Trưởng phòng', action:'Duyệt, gửi Trung ương', status:'SENT_TO_TW', note:'' },
      { time:'05/07/2026 15:15', actor:'Lê Thị Thanh Hằng', role:'Trung ương', action:'Xem xét, áp tiêu chí phụ −1', status:'TW_REVIEWING', note:'Trừ 1 điểm nộp bổ sung trễ' },
      { time:'07/07/2026 10:05', actor:'Lê Thị Thanh Hằng', role:'Trung ương', action:'Phê duyệt kết quả', status:'APPROVED', note:'Tổng cuối: 86.5. Chờ công bố đợt 1' }
    ] },

  { id:'HS-2026-009', locality:'tiendien', localityName:'Xã Tiên Điền', district:'H. Nghi Xuân, Hà Tĩnh', dept:'pb3',
    status:'PUBLISHED', deadline:'15/07/2026', total:90.2,
    bonus:[ {label:'Mô hình "Khu dân cư số" tiêu biểu', points:+1.5, reason:'Được chọn nhân rộng toàn tỉnh', by:'Lê Thị Thanh Hằng'} ],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-td-tuyentruyen.pdf','pdf')], B1:[EV('bc-kdc-so.pdf','pdf'),EV('video-kdc-so.mp4','video')], C1:[EV('bb-giam-sat-td.pdf','pdf')], D2:[EV('hinh-tap-huan-td.jpg','img')] },
    scores:{ A1:{score:92,note:''}, A2:{score:90,note:''}, B1:{score:93,note:''}, B2:{score:88,note:''}, B3:{score:87,note:''}, C1:{score:90,note:''}, C2:{score:89,note:''}, D1:{score:91,note:''}, D2:{score:90,note:''} },
    reviewComment:'Dẫn đầu toàn đợt, mô hình chuyển đổi số nổi bật.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'01/07/2026 16:20', actor:'Nguyễn Du Khánh', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'02/07/2026 09:00', actor:'Ngô Văn Sáu', role:'Chuyên viên', action:'Chấm điểm xong, gửi trưởng phòng', status:'PENDING_APPROVAL', note:'Tổng: 90.2' },
      { time:'02/07/2026 15:40', actor:'Lê Văn Kiên', role:'Trưởng phòng', action:'Duyệt, gửi Trung ương', status:'SENT_TO_TW', note:'' },
      { time:'03/07/2026 10:25', actor:'Lê Thị Thanh Hằng', role:'Trung ương', action:'Thêm tiêu chí phụ +1.5, phê duyệt', status:'APPROVED', note:'' },
      { time:'04/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Công bố kết quả đợt 1', status:'PUBLISHED', note:'Tổng cuối: 91.7 — Hạng 1 tạm thời' }
    ] },

  { id:'HS-2026-010', locality:'codam', localityName:'Xã Cổ Đạm', district:'H. Nghi Xuân, Hà Tĩnh', dept:'pb3',
    status:'PUBLISHED', deadline:'15/07/2026', total:78.1, bonus:[],
    selfCheck:{A1:1,A2:1,B1:1,B2:1,B3:1,C1:1,C2:1,D1:1,D2:1},
    evidence:{ A1:[EV('bc-cd-tuyentruyen.pdf','pdf')], B3:[EV('chung-tu-cd.pdf','pdf')], C1:[EV('bb-gs-cd.pdf','pdf')] },
    scores:{ A1:{score:78,note:''}, A2:{score:76,note:''}, B1:{score:80,note:''}, B2:{score:75,note:''}, B3:{score:82,note:''}, C1:{score:79,note:''}, C2:{score:77,note:''}, D1:{score:80,note:''}, D2:{score:78,note:''} },
    reviewComment:'Đạt yêu cầu, cần đẩy mạnh phong trào sáng tạo.',
    history:[
      { time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ', status:'DRAFT', note:'' },
      { time:'02/07/2026 08:50', actor:'Trịnh Văn Lâm', role:'Đại diện địa phương', action:'Nộp hồ sơ', status:'SUBMITTED', note:'' },
      { time:'03/07/2026 11:35', actor:'Ngô Văn Sáu', role:'Chuyên viên', action:'Chấm xong, gửi trưởng phòng', status:'PENDING_APPROVAL', note:'Tổng: 78.1' },
      { time:'03/07/2026 16:10', actor:'Lê Văn Kiên', role:'Trưởng phòng', action:'Duyệt, gửi Trung ương', status:'SENT_TO_TW', note:'' },
      { time:'04/07/2026 08:40', actor:'Lê Thị Thanh Hằng', role:'Trung ương', action:'Phê duyệt', status:'APPROVED', note:'' },
      { time:'04/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Công bố kết quả đợt 1', status:'PUBLISHED', note:'Tổng cuối: 78.1' }
    ] }
];

/* ---------- Hoạt động gần đây (dashboard feed, mới nhất trước) ---------- */
const ACTIVITY = [
  { time:'08/07/2026 08:30', who:'Trần Thị Mai',      txt:'đăng nhập và cập nhật bằng chứng hồ sơ <b>HS-2026-001</b> (Xã Kim Liên)' },
  { time:'07/07/2026 10:05', who:'Lê Thị Thanh Hằng', txt:'phê duyệt hồ sơ <b>HS-2026-008</b> (Xã Xuân Giang) — tổng điểm 86.5' },
  { time:'07/07/2026 09:02', who:'Trần Văn Bình',     txt:'duyệt và gửi Trung ương hồ sơ <b>HS-2026-005</b> (TT Đô Lương)' },
  { time:'06/07/2026 14:30', who:'Lê Thị Thanh Hằng', txt:'thêm tiêu chí phụ <b>+2 điểm</b> cho <b>HS-2026-006</b> (Xã Tùng Ảnh)' },
  { time:'06/07/2026 08:35', who:'Nguyễn Văn Hùng',   txt:'bắt đầu chấm điểm hồ sơ <b>HS-2026-003</b> (Xã Nam Cát)' },
  { time:'05/07/2026 09:20', who:'Đỗ Thị Minh Châu',  txt:'yêu cầu <b>bổ sung bằng chứng</b> hồ sơ HS-2026-007 (Xã Lâm Trung Thủy)' },
  { time:'04/07/2026 09:00', who:'Hệ thống',          txt:'công bố kết quả đợt 1: <b>Xã Tiên Điền 91.7</b> · Xã Cổ Đạm 78.1' }
];

/* ---------- 9 báo cáo (BC-01→09) ---------- */
const REPORTS = [
  { code:'BC-01', name:'Báo cáo tổng hợp điểm theo địa phương', desc:'Bảng điểm chi tiết từng tiêu chí của tất cả địa phương trong kỳ.', aud:'Trung ương, Trưởng phòng', icon:'sum',  color:'#9B1C1C' },
  { code:'BC-02', name:'Bảng xếp hạng thi đua', desc:'Xếp hạng toàn quốc/tỉnh kèm huy chương và biến động so kỳ trước.', aud:'Tất cả vai trò', icon:'rank', color:'#C9A227', featured:true },
  { code:'BC-03', name:'Báo cáo theo nhóm tiêu chí', desc:'Điểm trung bình từng nhóm tiêu chí (A–D), nhận diện mặt mạnh/yếu.', aud:'Trung ương, Phòng ban', icon:'group', color:'#6D28D9' },
  { code:'BC-04', name:'Báo cáo tiến độ chấm điểm', desc:'Tỷ lệ hồ sơ đã chấm / đang chấm / quá hạn theo phòng ban.', aud:'Trưởng phòng, Admin', icon:'prog', color:'#1D4ED8' },
  { code:'BC-05', name:'Báo cáo bằng chứng minh chứng', desc:'Thống kê số lượng, loại bằng chứng đính kèm theo địa phương.', aud:'Chuyên viên, Trưởng phòng', icon:'file', color:'#0F766E' },
  { code:'BC-06', name:'So sánh giữa các kỳ đánh giá', desc:'Biểu đồ so sánh điểm Năm 2025 và Năm 2026 theo địa phương.', aud:'Trung ương, Người xem', icon:'cmp', color:'#B45309', featured:true },
  { code:'BC-07', name:'Báo cáo hoạt động người dùng', desc:'Nhật ký đăng nhập, thao tác chấm điểm, phê duyệt của người dùng.', aud:'Admin Hệ thống', icon:'user', color:'#3730A3' },
  { code:'BC-08', name:'Báo cáo hiệu suất phòng ban', desc:'Khối lượng chấm điểm, thời gian xử lý trung bình theo phòng.', aud:'Trung ương, Admin', icon:'dept', color:'#C2410C' },
  { code:'BC-09', name:'Báo cáo tùy chỉnh (Query Builder)', desc:'Tự chọn cột, bộ lọc, nhóm dữ liệu và kết xuất theo nhu cầu.', aud:'Trung ương, Admin', icon:'custom', color:'#5B6B0A' }
];

/* ---------- Ma trận phân quyền (PQ-01→07) ---------- */
/* f = full (✓ toàn quyền), m = quản lý, v = xem, - = không */
const PERM_MATRIX = [
  { group:'Quản lý hệ thống' },
  { fn:'Quản lý người dùng (QL-ND)',            admin:'f', tw:'-', truongphong:'-', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Quản lý địa phương (QL-DP)',            admin:'f', tw:'v', truongphong:'v', chuyenvien:'v', diaphuong:'-', viewer:'-' },
  { fn:'Quản lý phòng ban (QL-PB)',             admin:'f', tw:'v', truongphong:'m', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Quản lý tiêu chí thi đua (QL-TC)',      admin:'f', tw:'m', truongphong:'v', chuyenvien:'v', diaphuong:'v', viewer:'-' },
  { group:'Luồng hồ sơ thi đua' },
  { fn:'Nộp hồ sơ, tải bằng chứng (DU-01)',     admin:'f', tw:'-', truongphong:'-', chuyenvien:'-', diaphuong:'m', viewer:'-' },
  { fn:'Chấm điểm theo tiêu chí (DU-02)',       admin:'f', tw:'-', truongphong:'v', chuyenvien:'m', diaphuong:'-', viewer:'-' },
  { fn:'Yêu cầu bổ sung bằng chứng (DU-03)',    admin:'f', tw:'-', truongphong:'m', chuyenvien:'m', diaphuong:'-', viewer:'-' },
  { fn:'Duyệt & gửi Trung ương (DU-04)',        admin:'f', tw:'-', truongphong:'m', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Thêm tiêu chí phụ ± điểm (DU-05)',      admin:'f', tw:'m', truongphong:'-', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Hoàn trả hồ sơ (DU-06)',                admin:'f', tw:'m', truongphong:'m', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Phê duyệt cuối & công bố',              admin:'f', tw:'m', truongphong:'-', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { group:'Báo cáo & thống kê' },
  { fn:'Xem báo cáo tổng hợp (BC-01→06)',       admin:'f', tw:'f', truongphong:'v', chuyenvien:'v', diaphuong:'v', viewer:'v' },
  { fn:'Báo cáo hệ thống (BC-07→09)',           admin:'f', tw:'m', truongphong:'-', chuyenvien:'-', diaphuong:'-', viewer:'-' },
  { fn:'Xuất Excel / PDF',                      admin:'f', tw:'f', truongphong:'m', chuyenvien:'m', diaphuong:'-', viewer:'v' },
  { group:'Phân quyền' },
  { fn:'Cấu hình ma trận phân quyền (PQ-01)',   admin:'f', tw:'-', truongphong:'-', chuyenvien:'-', diaphuong:'-', viewer:'-' }
];

/* ---------- Điều hướng theo vai trò ---------- */
const NAV_ITEMS = [
  { id:'dashboard',  label:'Tổng quan',              icon:'home',  roles:['admin','tw','truongphong','chuyenvien','diaphuong','viewer'] },
  { id:'hoso',       label:'Hồ sơ thi đua',          icon:'doc',   roles:['admin','tw','truongphong','chuyenvien','diaphuong'], badge:true },
  { id:'diaphuong',  label:'Quản lý địa phương',     icon:'map',   roles:['admin','tw','truongphong','chuyenvien'] },
  { id:'phongban',   label:'Quản lý phòng ban',      icon:'org',   roles:['admin','tw','truongphong'] },
  { id:'tieuchi',    label:'Tiêu chí thi đua',       icon:'target',roles:['admin','tw','truongphong','chuyenvien','diaphuong'] },
  { id:'nguoidung',  label:'Quản lý người dùng',     icon:'users', roles:['admin'] },
  { id:'baocao',     label:'Báo cáo & thống kê',     icon:'chart', roles:['admin','tw','truongphong','viewer'] },
  { id:'phanquyen',  label:'Phân quyền',             icon:'shield',roles:['admin','tw','truongphong','chuyenvien','diaphuong','viewer'] }
];

/* ---------- Tên màn hình ---------- */
const SCREEN_TITLES = {
  dashboard:'Tổng quan', hoso:'Hồ sơ thi đua', diaphuong:'Quản lý địa phương', phongban:'Quản lý phòng ban',
  tieuchi:'Quản lý tiêu chí thi đua', nguoidung:'Quản lý người dùng', baocao:'Báo cáo & thống kê', phanquyen:'Ma trận phân quyền'
};
