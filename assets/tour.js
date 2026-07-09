/* =====================================================================
   tour.js — hướng dẫn sử dụng từ đầu đến cuối (driver.js v1.3.6, local)
   Trình bày theo Luồng xử lý tổng thể (SRS 3.7): Thiết lập → Thu thập &
   Chấm điểm & Duyệt → Trung ương & Báo cáo. Phản ánh đầy đủ các chức năng
   CRUD tiêu chí, CRUD phòng ban và các điều chỉnh luồng duyệt.
   ===================================================================== */
(function(){
  var TOUR_FLAG = 'mtq_tour_done';
  var driverFactory = window.driver && window.driver.js && window.driver.js.driver;
  if(!driverFactory){ console.warn('driver.js chưa được nạp — bỏ qua tour'); return; }

  var dObj = null;

  /* điều hướng tới màn hình của bước (render đồng bộ); dùng replaceState để
     không kích hoạt hashchange gây render lần hai làm mất phần tử highlight. */
  function gotoHash(hash){
    if(!hash || location.hash === hash) return;
    history.replaceState(null, '', hash);
    parseHash(); renderAll();
  }

  /* đóng mọi modal/drawer đang mở (dùng khi chuyển bước để không tích lũy) */
  function closeOverlays(){
    if(typeof closeModal==='function') closeModal();
    if(typeof closeDrawer==='function') closeDrawer();
  }

  function buildSteps(){
    var N = (typeof ALL_CRITERIA==='function') ? ALL_CRITERIA().length : 9;
    var steps = [
      /* ---------- Mở đầu ---------- */
      { popover:{
          title:'👋 Chào mừng đến với MTQ-ERP',
          description:'Đây là demo tương tác của <b>Module Đánh giá Thi đua Địa phương</b>. Hướng dẫn này đi theo đúng '+
            '<b>Luồng xử lý tổng thể (SRS 3.7)</b> qua 3 giai đoạn: <b>Thiết lập → Thu thập &amp; Chấm điểm &amp; Duyệt → Trung ương &amp; Báo cáo</b>. '+
            'Tour tạm dùng vai trò <b>Admin Hệ thống</b> để truy cập mọi màn hình.'
      }},
      { hash:'#/dashboard', element:'#role-switch', popover:{
          title:'Chuyển vai trò (RBAC)',
          description:'Đổi giữa <b>6 vai trò</b>: Admin, Trung ương, Trưởng phòng, Chuyên viên, Đại diện địa phương, Người xem. '+
            'Menu trái, các nút hành động và <b>phạm vi dữ liệu</b> thay đổi ngay theo vai trò.',
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
          description:'Các chỉ số nhanh cập nhật trực tiếp khi hồ sơ chuyển bước: địa phương tham gia, đã nộp, đang chấm/duyệt, đã công bố.',
          side:'bottom'
      }},
      { hash:'#/dashboard', element:'#card-status-donut', popover:{
          title:'9 trạng thái hồ sơ',
          description:'Phân bố theo <b>9 trạng thái nghiệp vụ</b>: Bản nháp → Đã nộp → Đang chấm → Chờ trưởng phòng → Gửi TW → TW xem xét → (Yêu cầu sửa) → Phê duyệt → Công bố.',
          side:'left'
      }},

      /* ---------- GIAI ĐOẠN 1: THIẾT LẬP ---------- */
      { hash:'#/nguoidung', element:'#user-tbody', popover:{
          title:'① Thiết lập · Người dùng (QL-ND)',
          description:'<b>Bước 1 của luồng:</b> Admin quản lý tài khoản cán bộ. Bấm một dòng để xem chi tiết, phân công, lịch sử đăng nhập; có thể <b>vô hiệu hóa</b> (không xóa để giữ lịch sử). Bước sau mở form tạo tài khoản thật.',
          side:'top'
      }},
      { hash:'#/nguoidung', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateUser(); },
        onDeselected:function(){ if(typeof closeModal==='function') closeModal(); },
        popover:{
          title:'Thao tác · Tạo tài khoản người dùng (QL-ND-01)',
          description:'Form thật khi bấm <b>“Tạo tài khoản”</b>: nhập <b>họ tên, email, đơn vị, vai trò</b>… Hệ thống gán vai trò (RBAC) và trạng thái hoạt động. Bấm “Tạo tài khoản” để lưu.',
          side:'left', align:'start'
      }},
      { hash:'#/diaphuong', element:'.tree', popover:{
          title:'① Thiết lập · Địa phương (QL-DP)',
          description:'<b>Bước 2, 5–7:</b> cây hành chính <b>Tỉnh → Huyện → Xã</b>. Bấm một xã để xem phòng ban quản lý, bộ tiêu chí được gán và lịch sử điểm. Phòng ban quản lý được suy ra trực tiếp từ phân công ở màn Phòng ban.',
          side:'right'
      }},
      { hash:'#/diaphuong', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateLocality(); },
        onDeselected:function(){ if(typeof closeModal==='function') closeModal(); },
        popover:{
          title:'Thao tác · Thêm địa phương (QL-DP-01)',
          description:'Form thật khi bấm <b>“Thêm địa phương”</b>: nhập <b>tên đơn vị</b>, chọn <b>huyện trực thuộc</b> (phân cấp) và <b>chủ tịch MTTQ</b>. Ngoài ra màn này còn hỗ trợ <b>nhập từ Excel</b> và <b>kéo–thả</b> chuyển cấp trong cây.',
          side:'left', align:'start'
      }},
      { hash:'#/phongban', element:'.dept-card', popover:{
          title:'① Thiết lập · Phòng ban (QL-PB)',
          description:'<b>Bước 3, 6:</b> mỗi thẻ có <b>mã, mô tả, thành viên, tiến độ chấm điểm</b> (tính động từ hồ sơ). Bước sau sẽ <b>mở bảng quản lý thật</b> để xem chi tiết các thao tác.',
          side:'top'
      }},
      { hash:'#/phongban', element:'.d-panel',
        onHighlightStarted:function(){ App.deptDetail('pb1'); },
        onDeselected:function(){ if(typeof closeDrawer==='function') closeDrawer(); },
        popover:{
          title:'Thao tác · Quản lý phòng ban (QL-PB-01→06)',
          description:'Bảng quản lý mở khi bấm <b>“Chi tiết &amp; quản lý”</b>. Tại đây: <b>Sửa thông tin</b> phòng (QL-PB-01); <b>Thêm thành viên</b> + <b>phân chức vụ</b> Trưởng/Phó phòng/Chuyên viên và <b>gỡ</b> thành viên (QL-PB-02); <b>Gán địa phương</b> phụ trách — một địa phương có thể do nhiều phòng (QL-PB-03); thiết lập <b>quy trình duyệt nội bộ</b>: thêm/xóa/sắp xếp bước (QL-PB-04); xem <b>tiến độ chấm điểm</b> (QL-PB-05); <b>Vô hiệu hóa</b> giữ lịch sử (QL-PB-06).',
          side:'left', align:'start'
      }},
      { hash:'#/tieuchi', element:'.wsum', popover:{
          title:'① Thiết lập · Tiêu chí — trọng số (QL-TC)',
          description:'<b>Bước 4:</b> Trung ương ban hành bộ tiêu chí <b>Nhóm → Tiêu chí → Chỉ số con</b>. Hệ thống kiểm tra <b>tổng trọng số các nhóm phải đủ 100%</b> mới hợp lệ.',
          side:'bottom'
      }},
      { hash:'#/tieuchi', element:'.cg', popover:{
          title:'① Thiết lập · Tiêu chí — thêm/sửa/xóa',
          description:'Ở đầu mỗi nhóm và mỗi tiêu chí có nút <b>thêm / sửa / xóa</b>. Hai bước sau sẽ <b>mở trực tiếp các form thật</b> để bạn thấy cách nhập liệu.',
          side:'right'
      }},
      { hash:'#/tieuchi', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateGroup(); },
        onDeselected:function(){ if(typeof closeModal==='function') closeModal(); },
        popover:{
          title:'Thao tác · Tạo nhóm tiêu chí (QL-TC-01)',
          description:'Đây là form thật khi bấm <b>“Tạo nhóm tiêu chí”</b>. Nhập <b>tên nhóm</b>, <b>mô tả</b> và <b>trọng số (%)</b>. Hệ thống nhắc <b>tổng trọng số các nhóm phải đủ 100%</b> mới hợp lệ. Bấm <b>“Tạo nhóm”</b> để lưu, hoặc “Hủy” để bỏ.',
          side:'left', align:'start'
      }},
      { hash:'#/tieuchi', element:'.m-box',
        onHighlightStarted:function(){ if(typeof closeModal==='function') closeModal(); App.openCreateCrit('A'); },
        onDeselected:function(){ if(typeof closeModal==='function') closeModal(); },
        popover:{
          title:'Thao tác · Thêm tiêu chí &amp; chỉ số con (QL-TC-02/03)',
          description:'Form thêm tiêu chí vào một nhóm: <b>mã</b> (tự gợi ý, chống trùng), <b>tên</b>, <b>mô tả</b>, <b>thang điểm</b> (0–10 hoặc 0–100), <b>trọng số</b> và <b>loại bằng chứng</b> yêu cầu (chọn nhiều). Sau khi tạo, bấm nút <b>danh sách</b> trên mỗi tiêu chí để quản lý <b>chỉ số con có thang điểm riêng</b> (QL-TC-03); nút <b>sửa/xóa</b> nằm cạnh mỗi nhóm và tiêu chí.',
          side:'left', align:'start'
      }},
      { hash:'#/tieuchi', element:'#sim-panel', popover:{
          title:'① Thiết lập · Mô phỏng điểm (QL-TC-07)',
          description:'Kéo thanh trượt để thử điểm từng tiêu chí — <b>tổng điểm có trọng số</b> tính lại tức thì, giúp cân nhắc trước khi ban hành.',
          side:'left'
      }},

      /* ---------- GIAI ĐOẠN 2: THU THẬP · CHẤM ĐIỂM · DUYỆT ---------- */
      { hash:'#/hoso', element:'#hs-row-HS-2026-001', popover:{
          title:'② Thu thập &amp; chấm điểm · Hồ sơ demo',
          description:'Hồ sơ <b>HS-2026-001 (Xã Kim Liên)</b> đi trọn <b>luồng 5 bước</b>. Thanh gợi ý trong hồ sơ luôn chỉ việc cần làm tiếp kèm nút <b>“Chuyển vai”</b> và <b>điền nhanh</b> — hoàn thành cả luồng trong ~1 phút.',
          side:'bottom'
      }},
      { hash:'#/hoso/HS-2026-001', element:'.stepper', popover:{
          title:'② Luồng duyệt 5 bước',
          description:'<b>B1</b> Địa phương nộp bằng chứng → <b>B2</b> Chuyên viên chấm điểm → <b>B3</b> Trưởng phòng duyệt → <b>B4</b> Trung ương phê duyệt (+ tiêu chí phụ) → <b>B5</b> Công bố. Bước hiện tại được tô đậm.',
          side:'bottom'
      }},
      { hash:'#/hoso/HS-2026-001', element:'#dossier-criteria', popover:{
          title:'② Bằng chứng · Tự đánh giá · Chấm điểm',
          description:'Địa phương đính kèm <b>bằng chứng</b> (tài liệu/hình ảnh/video/số liệu) cho từng tiêu chí; <b>tự đánh giá là tùy chọn</b> (bước 11). Chuyên viên nhập điểm — <b>tổng '+N+' tiêu chí</b> tự tính theo trọng số, ghi <b>nhận xét</b> và <b>đề xuất khen thưởng/kỷ luật</b> (bước 16). <b>Trưởng phòng có thể điều chỉnh điểm</b> trước khi duyệt (bước 18).',
          side:'top'
      }},
      { hash:'#/hoso/HS-2026-001', element:'.timeline', popover:{
          title:'② Lịch sử trạng thái (DU-07)',
          description:'Mọi lần chuyển trạng thái đều ghi lại <b>thời gian, người thực hiện, vai trò và ghi chú</b> (kể cả khi trưởng phòng điều chỉnh điểm) — minh bạch, truy vết được.',
          side:'left'
      }},

      /* ---------- GIAI ĐOẠN 3: TRUNG ƯƠNG & BÁO CÁO ---------- */
      { hash:'#/baocao', element:'#bc02-card', popover:{
          title:'③ Trung ương &amp; Báo cáo · Xếp hạng (BC-02)',
          description:'Trung ương <b>so sánh điểm giữa các địa phương</b> (bước 20) qua bảng xếp hạng và biểu đồ so sánh hai kỳ. Sau khi thêm <b>tiêu chí phụ ±điểm</b> và <b>công bố</b>, thứ hạng cập nhật ngay. Mọi báo cáo xuất được Excel/PDF.',
          side:'top'
      }},
      { hash:'#/phanquyen', element:'#perm-matrix', popover:{
          title:'③ Ma trận phân quyền (PQ)',
          description:'Toàn bộ quyền theo SRS — <b>cột tô đậm là vai trò bạn đang dùng</b>. PQ-05: Admin Hệ thống không bị giới hạn bởi ma trận này.',
          side:'top'
      }},

      /* ---------- Kết thúc ---------- */
      { popover:{
          title:'🚀 Đến lượt bạn trải nghiệm!',
          description:'<b>Kịch bản đề xuất:</b> chuyển sang <b>Đại diện địa phương</b> → mở <b>HS-2026-001</b> → đính kèm nhanh bộ mẫu → <b>Nộp hồ sơ</b> (không cần tự đánh giá). '+
            'Rồi lần lượt: <b>Chuyên viên</b> chấm điểm + đề xuất khen thưởng → <b>Trưởng phòng</b> điều chỉnh &amp; duyệt → <b>Trung ương</b> thêm tiêu chí phụ, phê duyệt → <b>Công bố</b>. '+
            'Mở lại hướng dẫn bất kỳ lúc nào bằng nút <b>“Hướng dẫn”</b> trên thanh công cụ.'
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
    /* trình bày ở vai trò Admin để mọi màn hình và nút quản lý đều hiển thị */
    if(state.role !== 'admin'){ state.role = 'admin'; }
    if(location.hash === '#/dashboard'){ parseHash(); renderAll(); }
    else gotoHash('#/dashboard');
    closeModal && closeModal(); closeDrawer && closeDrawer();

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
        closeOverlays();                         // đóng modal/drawer của bước hiện tại
        var i = dObj.getActiveIndex();
        var nxt = steps[i+1];
        if(nxt && nxt.hash) gotoHash(nxt.hash);
        dObj.moveNext();                         // onHighlightStarted của bước sau sẽ mở form nếu cần
      },
      onPrevClick: function(){
        closeOverlays();
        var i = dObj.getActiveIndex();
        var prv = steps[i-1];
        if(prv && prv.hash) gotoHash(prv.hash);
        dObj.movePrevious();
      },
      onDestroyed: function(){
        if(typeof closeModal==='function') closeModal();
        if(typeof closeDrawer==='function') closeDrawer();
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
