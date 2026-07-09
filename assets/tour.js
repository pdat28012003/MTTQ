/* =====================================================================
   tour.js — HƯỚNG DẪN SỬ DỤNG từ đầu đến cuối (driver.js v1.3.6, local)
   Bám luồng mới: TẠO tiêu chí (dùng chung) → GÁN cho địa phương (địa phương
   là chủ thể, QL-DP-04) → nộp → chấm theo tiêu chí được gán → duyệt 5 cấp →
   công bố. Các bước "Thao tác" mở thẳng form/drawer thật để minh hoạ CRUD.
   ===================================================================== */
(function(){
  var TOUR_FLAG = 'mtq_tour_done';
  var driverFactory = window.driver && window.driver.js && window.driver.js.driver;
  if(!driverFactory){ console.warn('driver.js chưa được nạp — bỏ qua tour'); return; }

  var dObj = null;

  function gotoHash(hash){
    if(!hash || location.hash === hash) return;
    history.replaceState(null, '', hash); parseHash(); renderAll();
  }
  function closeOverlays(){
    if(typeof closeModal==='function') closeModal();
    if(typeof closeDrawer==='function') closeDrawer();
  }

  function buildSteps(){
    var steps = [
      /* ---------- Mở đầu ---------- */
      { popover:{
          title:'👋 Chào mừng đến với MTQ-ERP',
          description:'Demo tương tác của <b>Module Đánh giá Thi đua Địa phương</b>. Hướng dẫn đi theo <b>luồng nghiệp vụ thực tế</b>: '+
            '<b>Thiết lập → Gán tiêu chí cho địa phương → Nộp &amp; Chấm điểm → Duyệt 5 cấp → Công bố</b>. Tour tạm dùng vai trò <b>Admin</b> để xem mọi màn hình. '+
            'Muốn xem <b>một hồ sơ tự chạy trọn vòng đời</b>, dùng nút <b>“Kịch bản”</b> trên thanh công cụ.'
      }},
      { hash:'#/dashboard', element:'#role-switch', popover:{
          title:'Chuyển vai trò (RBAC)',
          description:'Đổi giữa <b>6 vai trò</b>: Admin, Trung ương, Trưởng phòng, Chuyên viên, Đại diện địa phương, Người xem. '+
            'Menu trái, nút hành động và <b>phạm vi dữ liệu</b> thay đổi ngay theo vai trò.',
          side:'bottom', align:'end'
      }},
      { element:'#rolebanner', popover:{
          title:'Băng rôn vai trò',
          description:'Luôn cho biết bạn đang ở vai trò nào và <b>được phép làm gì</b> trong phạm vi hiện tại.',
          side:'bottom'
      }},
      { element:'#nav', popover:{
          title:'Điều hướng nghiệp vụ',
          description:'8 màn hình: Tổng quan, Hồ sơ thi đua, Địa phương, Phòng ban, Tiêu chí, Người dùng, Báo cáo, Phân quyền. '+
            'Huy hiệu đỏ là số <b>hồ sơ đang chờ bạn xử lý</b>.',
          side:'right'
      }},
      { hash:'#/dashboard', element:'.kpi-grid', popover:{
          title:'Tổng quan kỳ đánh giá',
          description:'Chỉ số nhanh cập nhật trực tiếp khi hồ sơ chuyển bước: địa phương tham gia, đã nộp, đang chấm/duyệt, đã công bố.',
          side:'bottom'
      }},
      { hash:'#/dashboard', element:'#card-status-donut', popover:{
          title:'9 trạng thái hồ sơ',
          description:'Phân bố theo <b>9 trạng thái</b>: Bản nháp → Đã nộp → Đang chấm → Chờ trưởng phòng → Gửi TW → TW xem xét → (Yêu cầu sửa) → Phê duyệt → Công bố.',
          side:'left'
      }},

      /* ---------- GIAI ĐOẠN 1: THIẾT LẬP ---------- */
      { hash:'#/nguoidung', element:'#user-tbody', popover:{
          title:'① Thiết lập · Người dùng (QL-ND)',
          description:'Admin quản lý tài khoản cán bộ: bấm một dòng để xem chi tiết, phân công, lịch sử đăng nhập; có thể <b>vô hiệu hóa</b> (không xóa để giữ lịch sử). Bước sau mở form tạo tài khoản thật.',
          side:'top'
      }},
      { hash:'#/nguoidung', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateUser(); },
        popover:{
          title:'Thao tác · Tạo tài khoản (QL-ND-01)',
          description:'Nhập <b>họ tên, email, đơn vị, vai trò</b>. Gán vào phòng ban để <b>duyệt theo cấp</b>. Lưu ý: mỗi địa phương có tài khoản riêng, nhưng <b>chỉ “Đại diện địa phương” mới được nộp bằng chứng</b>.',
          side:'left', align:'start'
      }},
      { hash:'#/phongban', element:'.dept-card', popover:{
          title:'① Thiết lập · Phòng ban (QL-PB)',
          description:'Mỗi thẻ có <b>mã, mô tả, thành viên, tiến độ chấm điểm</b> (tính động từ hồ sơ). Bước sau mở bảng quản lý thật.',
          side:'top'
      }},
      { hash:'#/phongban', element:'.d-panel',
        onHighlightStarted:function(){ App.deptDetail('pb1'); },
        popover:{
          title:'Thao tác · Quản lý phòng ban (QL-PB-01→06)',
          description:'Bấm <b>“Chi tiết &amp; quản lý”</b>: <b>Sửa</b> phòng (01); <b>Thêm thành viên + chức vụ</b> (02); <b>Gán địa phương</b> phụ trách — một xã có thể do nhiều phòng (03); <b>Quy trình duyệt nội bộ</b> thêm/xóa/sắp xếp (04); xem <b>tiến độ</b> (05); <b>Vô hiệu hóa</b> giữ lịch sử (06).',
          side:'left', align:'start'
      }},
      { hash:'#/diaphuong', element:'.tree', popover:{
          title:'① Thiết lập · Địa phương (QL-DP)',
          description:'Cây hành chính <b>Tỉnh → Huyện → Xã</b>. Bấm một xã để xem hồ sơ, phòng ban quản lý và <b>bộ tiêu chí riêng của xã đó</b>. Bước sau mở form thêm địa phương.',
          side:'right'
      }},
      { hash:'#/diaphuong', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); App.openCreateLocality(); },
        popover:{
          title:'Thao tác · Thêm địa phương (QL-DP-01)',
          description:'Nhập <b>tên đơn vị</b>, chọn <b>huyện trực thuộc</b>, <b>chủ tịch MTTQ</b>. Màn này còn hỗ trợ <b>nhập từ Excel</b> và kéo–thả chuyển cấp trong cây.',
          side:'left', align:'start'
      }},

      /* --- Xây bộ tiêu chí (dùng chung) --- */
      { hash:'#/tieuchi', element:'.wsum', popover:{
          title:'② Bộ tiêu chí · Trọng số (QL-TC)',
          description:'Xây <b>bộ tiêu chí dùng chung</b> theo <b>Nhóm → Tiêu chí → Chỉ số con</b>. Hệ thống kiểm tra <b>tổng trọng số các nhóm = 100%</b>. Đây mới là nơi <b>tạo</b> tiêu chí — việc <b>gán cho địa phương</b> làm ở màn Địa phương (bước sau).',
          side:'bottom'
      }},
      { hash:'#/tieuchi', element:'.cg', popover:{
          title:'② Bộ tiêu chí · Thêm/sửa/xóa',
          description:'Đầu mỗi nhóm và mỗi tiêu chí có nút <b>thêm / sửa / xóa</b>. Hai bước sau mở trực tiếp các form thật.',
          side:'right'
      }},
      { hash:'#/tieuchi', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateGroup(); },
        popover:{
          title:'Thao tác · Tạo nhóm tiêu chí (QL-TC-01)',
          description:'Nhập <b>tên nhóm</b>, <b>mô tả</b>, <b>trọng số (%)</b>. Hệ thống nhắc tổng trọng số các nhóm phải đủ 100%.',
          side:'left', align:'start'
      }},
      { hash:'#/tieuchi', element:'.m-box',
        onHighlightStarted:function(){ if(typeof closeModal==='function') closeModal(); App.openCreateCrit('A'); },
        popover:{
          title:'Thao tác · Thêm tiêu chí &amp; chỉ số con (QL-TC-02/03)',
          description:'Nhập <b>mã, tên, mô tả, thang điểm</b> (0–10/0–100), <b>trọng số</b> và <b>loại bằng chứng</b>. Sau khi tạo, nút <b>danh sách</b> quản lý <b>chỉ số con có thang điểm riêng</b> (03); nút <b>sửa/xóa</b> cạnh mỗi tiêu chí.',
          side:'left', align:'start'
      }},
      { hash:'#/tieuchi', element:'#sim-panel', popover:{
          title:'② Bộ tiêu chí · Mô phỏng điểm (QL-TC-07)',
          description:'Kéo thanh trượt để thử điểm — <b>tổng điểm có trọng số</b> tính lại tức thì, giúp cân nhắc trước khi ban hành.',
          side:'left'
      }},

      /* --- Gán tiêu chí cho địa phương (địa phương là chủ thể) --- */
      { hash:'#/diaphuong', element:'.m-box',
        onHighlightStarted:function(){ if(typeof closeModal==='function') closeModal(); ui.treeSel='kimlien'; App.openAddLocCriteria('kimlien'); },
        popover:{
          title:'③ Gán tiêu chí cho địa phương (QL-DP-04)',
          description:'<b>Điểm mấu chốt:</b> địa phương là <b>chủ thể</b> được gán tiêu chí. Vào <b>Địa phương → chọn xã → “Thêm tiêu chí”</b> → hiện <b>danh sách tiêu chí đã tạo</b> → tích chọn → <b>Thêm</b>. '+
            'Mỗi địa phương có thể có <b>bộ tiêu chí khác nhau</b>; xã được gán tiêu chí nào thì phải nộp &amp; được chấm đúng tiêu chí đó — hệ thống <b>tự tạo hồ sơ</b>. Khi đang chấm vẫn có thể <b>bổ sung tiêu chí</b>.',
          side:'left', align:'start'
      }},

      /* ---------- GIAI ĐOẠN 2: NỘP · CHẤM ĐIỂM · DUYỆT ---------- */
      { hash:'#/hoso', element:'#hs-row-HS-2026-001', popover:{
          title:'④ Nộp &amp; chấm điểm · Hồ sơ demo',
          description:'Hồ sơ <b>HS-2026-001 (Xã Kim Liên)</b> đi trọn <b>luồng 5 bước</b>. Thanh gợi ý trong hồ sơ luôn chỉ việc cần làm tiếp kèm nút <b>“Chuyển vai”</b> và <b>điền nhanh</b>.',
          side:'bottom'
      }},
      { hash:'#/hoso/HS-2026-001', element:'.stepper', popover:{
          title:'④ Luồng duyệt 5 bước',
          description:'<b>B1</b> Địa phương nộp bằng chứng → <b>B2</b> Chuyên viên chấm → <b>B3</b> Trưởng phòng duyệt → <b>B4</b> Trung ương phê duyệt (+ tiêu chí phụ) → <b>B5</b> Công bố.',
          side:'bottom'
      }},
      { hash:'#/hoso/HS-2026-001', element:'#dossier-criteria', popover:{
          title:'④ Bằng chứng · Chấm điểm (theo tiêu chí được gán)',
          description:'Hồ sơ chỉ hiển thị <b>đúng các tiêu chí đã gán cho xã này</b> (QL-DP-04). Địa phương đính kèm bằng chứng (tự đánh giá tùy chọn); Chuyên viên nhập điểm — <b>tổng chuẩn hóa về thang 100</b>, ghi nhận xét và đề xuất khen thưởng. Có nút <b>“Bổ sung tiêu chí”</b> để thêm tiêu chí ngay khi chấm; <b>Trưởng phòng có thể điều chỉnh điểm</b> trước khi duyệt.',
          side:'top'
      }},
      { hash:'#/hoso/HS-2026-001', element:'.timeline', popover:{
          title:'④ Lịch sử trạng thái (DU-07)',
          description:'Mọi lần chuyển trạng thái đều ghi lại <b>thời gian, người thực hiện, vai trò, ghi chú</b> (kể cả khi điều chỉnh điểm) — minh bạch, truy vết được.',
          side:'left'
      }},

      /* ---------- GIAI ĐOẠN 3: TRUNG ƯƠNG & BÁO CÁO ---------- */
      { hash:'#/baocao', element:'#bc02-card', popover:{
          title:'⑤ Trung ương &amp; Báo cáo · Xếp hạng (BC-02)',
          description:'Trung ương <b>so sánh điểm giữa các địa phương</b> qua bảng xếp hạng và biểu đồ hai kỳ. Sau khi thêm <b>tiêu chí phụ ±điểm</b> và <b>công bố</b>, thứ hạng cập nhật ngay. Mọi báo cáo xuất Excel/PDF.',
          side:'top'
      }},
      { hash:'#/phanquyen', element:'#perm-matrix', popover:{
          title:'⑤ Ma trận phân quyền (PQ)',
          description:'Toàn bộ quyền theo SRS — <b>cột tô đậm là vai trò bạn đang dùng</b>. PQ-05: Admin không bị giới hạn bởi ma trận này.',
          side:'top'
      }},

      /* ---------- Kết thúc ---------- */
      { popover:{
          title:'🚀 Đến lượt bạn!',
          description:'Nhớ đúng luồng: <b>Tạo tiêu chí</b> (màn Tiêu chí) → <b>“Thêm tiêu chí” cho từng xã</b> (màn Địa phương) → Đại diện xã nộp → Chuyên viên chấm → Trưởng phòng duyệt → Trung ương phê duyệt &amp; công bố. '+
            'Muốn xem tất cả tự chạy, bấm <b>“Kịch bản”</b>. Mở lại hướng dẫn này bằng nút <b>“Hướng dẫn”</b>.'
      }}
    ];
    /* màn hình hẹp: sidebar ẩn sau hamburger → bỏ bước highlight menu trái */
    if(window.innerWidth <= 960){
      steps = steps.filter(function(s){ return s.element !== '#nav'; });
    }
    return steps;
  }

  window.startTour = function(){
    if(dObj){ dObj.destroy(); dObj = null; }
    if(state.role !== 'admin'){ state.role = 'admin'; }
    if(location.hash === '#/dashboard'){ parseHash(); renderAll(); }
    else gotoHash('#/dashboard');
    closeOverlays();

    var steps = buildSteps();
    dObj = driverFactory({
      showProgress: true,
      progressText: 'Bước {{current}}/{{total}}',
      nextBtnText: 'Tiếp theo →',
      prevBtnText: '← Quay lại',
      doneBtnText: 'Kết thúc',
      overlayOpacity: 0.62,
      stagePadding: 6,
      stageRadius: 10,
      allowClose: true,
      smoothScroll: true,
      steps: steps,
      onNextClick: function(){
        closeOverlays();
        var i = dObj.getActiveIndex();
        var nxt = steps[i+1];
        if(nxt && nxt.hash) gotoHash(nxt.hash);
        dObj.moveNext();
      },
      onPrevClick: function(){
        closeOverlays();
        var i = dObj.getActiveIndex();
        var prv = steps[i-1];
        if(prv && prv.hash) gotoHash(prv.hash);
        dObj.movePrevious();
      },
      onDestroyed: function(){
        closeOverlays();
        localStorage.setItem(TOUR_FLAG, '1');
        dObj = null;
      }
    });
    dObj.drive();
  };

  /* tự chạy ở lần truy cập đầu tiên */
  if(!localStorage.getItem(TOUR_FLAG)){
    setTimeout(function(){ window.startTour(); }, 700);
  }
})();
