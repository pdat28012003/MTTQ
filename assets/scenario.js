/* =====================================================================
   scenario.js — KỊCH BẢN DEMO chạy từ đầu đến cuối theo luồng nghiệp vụ mới
   Màn 1: Thiết lập (mở form thật: phòng ban → địa phương → gán ĐP vào phòng ban
          → người dùng → TẠO tiêu chí → THÊM tiêu chí cho địa phương QL-DP-04).
   Màn 2: Vòng đời hồ sơ (tự chạy HS-2026-001 qua 5 cấp đến công bố).
   ===================================================================== */
(function(){
  var driverFactory = window.driver && window.driver.js && window.driver.js.driver;
  if(!driverFactory){ console.warn('driver.js chưa nạp — bỏ qua kịch bản'); return; }
  var dObj = null;
  var D = 'HS-2026-001';

  function gotoHash(hash){
    if(!hash || location.hash === hash) return;
    history.replaceState(null, '', hash); parseHash(); renderAll();
  }
  function closeOverlays(){
    if(typeof closeModal==='function') closeModal();
    if(typeof closeDrawer==='function') closeDrawer();
  }
  function dz(){ return getDossier(D); }

  /* dựng lại trạng thái hồ sơ tới đúng chặng k (0..6) — nhất quán khi tiến/lùi.
     Chạy lại từ đầu bằng các hàm nghiệp vụ thật (để timeline đúng), tắt toast khi replay. */
  function advanceTo(k){
    var _toast = window.toast; window.toast = function(){};
    try{
      var d = dz();
      d.status='DRAFT'; d.scores={}; d.evidence={}; d.selfCheck={}; d.bonus=[]; d.reviewComment=''; d.rewardProposal=''; d.total=null;
      d.history=[{ time:'01/07/2026 09:00', actor:'Hệ thống', role:'Hệ thống', action:'Khởi tạo hồ sơ kỳ "Năm 2026"', status:'DRAFT', note:'Hạn nộp: 15/07/2026' }];
      App.switchRole('diaphuong');
      // chặng 0: đính kèm bằng chứng (vẫn Bản nháp)
      applicableCriteria(d).forEach(function(it){ if(!(d.evidence[it.id]||[]).length){ d.evidence[it.id]=[{name:'minh-chung-'+it.id.toLowerCase()+'-kimlien.pdf',type:'pdf'}]; } d.selfCheck[it.id]=1; });
      var acts = [
        function(){},
        function(){ App.submitDossier(D); },
        function(){ App.switchRole('chuyenvien'); App.startReview(D); App.fillSampleScores(D); d.rewardProposal='Đề nghị tặng Bằng khen cho tập thể xã Kim Liên.'; },
        function(){ App.sendToHead(D); },
        function(){ App.switchRole('truongphong'); App.approveSend(D); },
        function(){ App.switchRole('tw'); App.twReceive(D); d.bonus=[{label:'Điển hình toàn quốc', points:2, reason:'Khu dân cư kiểu mẫu, được TW biểu dương', by:'Trung ương'}]; },
        function(){ App.twApprove(D); App.publish(D); }
      ];
      for(var i=1;i<=k;i++){ acts[i](); }
    } finally { window.toast = _toast; }
    location.hash = '#/hoso/'+D; parseHash(); renderAll();
  }

  function buildSteps(){
    return [
      /* ---------- Mở đầu ---------- */
      { popover:{ title:'🎬 Kịch bản demo — từ đầu đến cuối',
          description:'Kịch bản này đi theo đúng <b>luồng nghiệp vụ</b>: <b>Thiết lập</b> (phòng ban, địa phương, người dùng, tiêu chí, gán tiêu chí cho địa phương) rồi <b>chạy trọn vòng đời một hồ sơ</b> qua 5 cấp đến khi công bố. Bấm <b>Tiếp theo</b> để bắt đầu.' } },

      /* ---------- MÀN 1: THIẾT LẬP ---------- */
      { hash:'#/phongban', element:'.m-box',
        onHighlightStarted:function(){ App.openCreateDept(); },
        popover:{ title:'① Tạo phòng ban (QL-PB-01)',
          description:'Trước tiên tạo các <b>phòng ban chuyên môn</b> — đơn vị sẽ chấm và duyệt điểm theo cấp. Nhập tên, mã, mô tả, trưởng phòng.', side:'left', align:'start' } },
      { hash:'#/diaphuong', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); App.openCreateLocality(); },
        popover:{ title:'② Tạo địa phương (QL-DP-01)',
          description:'Thêm <b>đơn vị hành chính</b> vào cây Tỉnh → Huyện → Xã. Xã/phường là đối tượng được chấm thi đua.', side:'left', align:'start' } },
      { hash:'#/phongban', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); App.openAssignLoc('pb1'); },
        popover:{ title:'③ Gán địa phương vào phòng ban (QL-PB-03)',
          description:'Chỉ định <b>phòng nào phụ trách chấm xã nào</b>. Một địa phương có thể do nhiều phòng cùng quản lý. Đây là cơ sở để hồ sơ đi đúng phòng duyệt.', side:'left', align:'start' } },
      { hash:'#/nguoidung', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); App.openCreateUser(); },
        popover:{ title:'④ Tạo người dùng &amp; gán vai trò (QL-ND / QL-PB-02)',
          description:'Tạo tài khoản cán bộ và gán vào phòng ban để <b>duyệt theo cấp</b>. Mỗi địa phương có tài khoản riêng, nhưng <b>chỉ tài khoản “Đại diện địa phương” mới được nộp bằng chứng</b>.', side:'left', align:'start' } },
      { hash:'#/tieuchi', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); App.openCreateCrit('A'); },
        popover:{ title:'⑤ Tạo tiêu chí: trọng số, thang điểm (QL-TC-02)',
          description:'Xây <b>bộ tiêu chí</b>: tên, <b>trọng số %</b>, <b>thang điểm</b> (0–10/0–100), loại bằng chứng. Có thể thêm chỉ số con (QL-TC-03). Tổng trọng số các nhóm = 100%.', side:'left', align:'start' } },
      { hash:'#/diaphuong', element:'.m-box',
        onHighlightStarted:function(){ closeOverlays(); ui.treeSel='kimlien'; App.openAddLocCriteria('kimlien'); },
        popover:{ title:'⑥ Thêm tiêu chí cho địa phương (QL-DP-04)',
          description:'<b>Bước then chốt:</b> địa phương là <b>chủ thể</b> được gán tiêu chí. Vào màn Địa phương → chọn xã → nhấn <b>“Thêm tiêu chí”</b> → hiện danh sách tiêu chí đã tạo → tích chọn → <b>Thêm</b>. <b>Mỗi địa phương có thể có bộ tiêu chí khác nhau</b>; địa phương có tiêu chí nào thì phải nộp &amp; được chấm tiêu chí đó. Khi đang chấm vẫn có thể <b>bổ sung tiêu chí</b>.', side:'left', align:'start' } },

      /* ---------- MÀN 2: VÒNG ĐỜI HỒ SƠ (tự chạy) ---------- */
      { hash:'#/hoso/'+D, element:'#dossier-criteria',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(0); },
        popover:{ title:'B1 · Đại diện địa phương đính kèm bằng chứng',
          description:'Nay chạy trọn vòng đời hồ sơ <b>Xã Kim Liên</b>. Ở vai <b>Đại diện địa phương</b>: đính kèm bằng chứng cho từng tiêu chí được gán (tự đánh giá là tùy chọn).', side:'top' } },
      { hash:'#/hoso/'+D, element:'.stepper',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(1); },
        popover:{ title:'Nộp hồ sơ (DU-01) → “Đã nộp”',
          description:'Địa phương <b>nộp hồ sơ</b>; hệ thống thông báo cho phòng ban phụ trách. Thanh tiến trình chuyển sang bước <b>B2</b>.', side:'bottom' } },
      { hash:'#/hoso/'+D, element:'#score-summary',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(2); },
        popover:{ title:'B2 · Chuyên viên chấm điểm (DU-02)',
          description:'Ở vai <b>Chuyên viên</b>: nhập điểm từng tiêu chí, <b>tổng điểm có trọng số tự tính</b> và chuẩn hóa về thang 100. Ghi nhận xét bắt buộc và đề xuất khen thưởng.', side:'left' } },
      { hash:'#/hoso/'+D, element:'.stepper',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(3); },
        popover:{ title:'Gửi trưởng phòng → “Chờ duyệt”',
          description:'Chuyên viên hoàn tất và <b>gửi trưởng phòng</b> xét duyệt.', side:'bottom' } },
      { hash:'#/hoso/'+D, element:'.stepper',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(4); },
        popover:{ title:'B3 · Trưởng phòng duyệt (DU-04)',
          description:'Ở vai <b>Trưởng phòng</b>: có thể <b>điều chỉnh điểm</b>, sau đó <b>duyệt và gửi lên Trung ương</b> (hoặc hoàn trả kèm lý do).', side:'bottom' } },
      { hash:'#/hoso/'+D, element:'#score-summary',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(5); },
        popover:{ title:'B4 · Trung ương thêm tiêu chí phụ (DU-05)',
          description:'Ở vai <b>Trung ương</b>: tiếp nhận, so sánh các địa phương, và thêm <b>tiêu chí phụ ± điểm</b> kèm lý do (ở đây +2). Tổng điểm cập nhật tức thì.', side:'left' } },
      { hash:'#/hoso/'+D, element:'#score-summary',
        onHighlightStarted:function(){ closeOverlays(); advanceTo(6); },
        popover:{ title:'B5 · Phê duyệt &amp; Công bố',
          description:'Trung ương <b>phê duyệt</b> rồi <b>công bố</b>. Hồ sơ chuyển trạng thái <b>“Đã công bố”</b> và địa phương vào bảng xếp hạng chính thức.', side:'left' } },
      { hash:'#/baocao', element:'#bc02-card',
        onHighlightStarted:function(){ closeOverlays(); },
        popover:{ title:'Xếp hạng &amp; công bố (BC-02)',
          description:'Kết quả cuối (gồm tiêu chí phụ) đưa <b>Xã Kim Liên</b> vào <b>bảng xếp hạng thi đua</b>, so sánh với kỳ trước. Mọi báo cáo xuất được Excel/PDF.', side:'top' } },

      /* ---------- Kết thúc ---------- */
      { popover:{ title:'✅ Hoàn tất kịch bản',
          description:'Bạn vừa xem trọn luồng: <b>Thiết lập → Ban hành tiêu chí cho địa phương → Nộp → Duyệt 5 cấp → Công bố</b>. Có thể tự thao tác lại từng bước, hoặc bấm <b>“Hướng dẫn”</b> để xem chi tiết từng chức năng.' } }
    ];
  }

  window.startScenario = function(){
    if(dObj){ dObj.destroy(); dObj = null; }
    if(state.role !== 'admin'){ state.role = 'admin'; }
    closeOverlays();
    gotoHash('#/phongban');

    var steps = buildSteps();
    dObj = driverFactory({
      showProgress:true, progressText:'Bước {{current}}/{{total}}',
      nextBtnText:'Tiếp theo →', prevBtnText:'← Quay lại', doneBtnText:'Kết thúc',
      overlayOpacity:0.62, stagePadding:6, stageRadius:10, allowClose:true, smoothScroll:true,
      steps: steps,
      onNextClick:function(){ closeOverlays(); var i=dObj.getActiveIndex(); var n=steps[i+1]; if(n&&n.hash) gotoHash(n.hash); dObj.moveNext(); },
      onPrevClick:function(){ closeOverlays(); var i=dObj.getActiveIndex(); var p=steps[i-1]; if(p&&p.hash) gotoHash(p.hash); dObj.movePrevious(); },
      onDestroyed:function(){ closeOverlays(); dObj=null; }
    });
    dObj.drive();
  };
})();
