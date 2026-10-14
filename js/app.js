(function () {
  'use strict';

  // ── 상수 ─────────────────────────────
  const TYPES = {
    present:     { label: '출석',     short: '' },
    late:        { label: '지각',     short: '지각' },
    early:       { label: '조퇴',     short: '조퇴' },
    absentClass: { label: '결과',     short: '결과' },
    absent:      { label: '결석',     short: '결석' },
    excused:     { label: '출석인정', short: '인정' },
  };
  const COUNTED = ['late', 'early', 'absentClass', 'absent', 'excused'];
  const REASONS = { illness: '질병', unexcused: '미인정', other: '기타' };
  const TAP_CYCLE = ['present', 'late', 'absentClass'];
  const DEFAULT_REASON = 'unexcused';
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const LONG_PRESS_MS = 450;

  // ── 상태 ─────────────────────────────
  let state = null;
  const ui = {
    view: 'roll',
    sectionId: 's1',
    date: today(),
    period: 1,
    statsSection: 's1',
    rosterSection: 's1',
    sheet: null, // { studentId, type, reason }
  };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ── 날짜 ─────────────────────────────
  function ymd(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function today() { return ymd(new Date()); }
  function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(s, n) { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekday(s) { return parseYmd(s).getDay(); }
  function prettyDate(s) {
    const d = parseYmd(s);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
  }
  function minutes(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }

  // ── 데이터 헬퍼 ─────────────────────────────
  const sessionKey = (sectionId, date, period) => `${sectionId}|${date}|${period}`;
  const currentKey = () => sessionKey(ui.sectionId, ui.date, ui.period);
  const sectionName = (id) => (state.sections.find((s) => s.id === id) || {}).name || id;

  function studentsOf(sectionId) {
    return state.students
      .filter((s) => s.active && s.sectionId === sectionId)
      .sort((a, b) => a.studentNo.localeCompare(b.studentNo));
  }

  function recordOf(key, studentId) {
    return (state.records[key] && state.records[key][studentId]) || null;
  }

  function ensureSession(key) {
    if (state.sessions[key]) return;
    const [sectionId, date, period] = key.split('|');
    state.sessions[key] = { sectionId, date, period: Number(period), memo: '', createdAt: new Date().toISOString() };
  }

  function setRecord(key, studentId, rec) {
    ensureSession(key);
    const bucket = (state.records[key] = state.records[key] || {});
    if (!rec || rec.type === 'present') delete bucket[studentId];
    else bucket[studentId] = { ...rec, updatedAt: new Date().toISOString() };
    if (!Object.keys(bucket).length) delete state.records[key];
    persist();
  }

  function cellLabel(rec) {
    if (!rec) return '';
    if (rec.type === 'excused') return '출석인정';
    return `${REASONS[rec.reason] || ''}${TYPES[rec.type].label}`;
  }

  // ── 저장 ─────────────────────────────
  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await window.AppStore.save(state); }
      catch (e) { console.error(e); toast('저장에 실패했습니다. 백업 파일을 받아 두십시오.'); }
    }, 250);
  }
  window.addEventListener('pagehide', () => { if (saveTimer) { clearTimeout(saveTimer); window.AppStore.save(state); } });

  // ── 토스트 ─────────────────────────────
  let toastTimer = null;
  function toast(msg, action) {
    const el = $('#toast');
    el.innerHTML = esc(msg);
    if (action) {
      const b = document.createElement('button');
      b.textContent = action.label;
      b.onclick = () => { action.run(); el.classList.remove('show'); };
      el.appendChild(b);
    }
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), action ? 3500 : 2200);
  }

  // ── 이미지 슬롯 대체 ─────────────────────────────
  function wireSlots(root) {
    root.querySelectorAll('img.slot').forEach((img) => {
      if (img.dataset.wired) return;
      img.dataset.wired = '1';
      const swap = () => {
        const fb = document.createElement('div');
        fb.className = 'slot-fallback';
        fb.textContent = img.dataset.fallback || '★';
        fb.setAttribute('aria-hidden', 'true');
        img.replaceWith(fb);
      };
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener('error', swap, { once: true });
    });
  }

  // ── 현재 수업 자동 선택 ─────────────────────────────
  function autoSelect() {
    const now = new Date();
    const wd = now.getDay();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const bells = state.bells;

    // 지금 진행 중(시작 10분 전부터)인 교시
    let current = bells.find((b) => nowMin >= minutes(b.start) - 10 && nowMin <= minutes(b.end));
    const todays = bells.filter((b) => state.timetable[`${wd}-${b.period}`]);

    let pick = null;
    if (current && state.timetable[`${wd}-${current.period}`]) pick = current;
    else if (todays.length) {
      // 다음 수업, 없으면 오늘 마지막 수업
      pick = todays.find((b) => minutes(b.end) >= nowMin) || todays[todays.length - 1];
    }
    if (pick) {
      ui.period = pick.period;
      ui.sectionId = state.timetable[`${wd}-${pick.period}`];
    } else if (current) {
      ui.period = current.period;
    }
    ui.date = today();
  }

  // ── 화면 전환 ─────────────────────────────
  function show(view) {
    ui.view = view;
    document.querySelectorAll('.view').forEach((v) => (v.hidden = v.id !== `view-${view}`));
    document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.view === view));
    $('#todayBtn').hidden = view !== 'roll';
    render();
    window.scrollTo({ top: 0 });
  }

  function render() {
    if (ui.view === 'roll') renderRoll();
    else if (ui.view === 'stats') renderStats();
    else if (ui.view === 'export') renderExport();
    else if (ui.view === 'settings') renderSettings();
  }

  function segTabs(el, current, onPick, withCount) {
    el.innerHTML = state.sections.map((s) => {
      const n = withCount ? `<small>${studentsOf(s.id).length}명</small>` : '';
      return `<button role="tab" data-id="${s.id}" class="${s.id === current ? 'on' : ''}" aria-selected="${s.id === current}">${esc(s.name)}${n}</button>`;
    }).join('');
    el.onclick = (e) => { const b = e.target.closest('button'); if (b) onPick(b.dataset.id); };
  }

  // ── 출석부 ─────────────────────────────
  function renderRoll() {
    segTabs($('#sectionTabs'), ui.sectionId, (id) => { ui.sectionId = id; renderRoll(); }, true);

    $('#dateLabel').textContent = prettyDate(ui.date) + (ui.date === today() ? ' · 오늘' : '');
    $('#dateInput').value = ui.date;

    renderChips();
    renderSessionBar();
    renderGrid();
  }

  function renderChips() {
    const wd = weekday(ui.date);
    $('#periodChips').innerHTML = state.bells.map((b) => {
      const isTT = state.timetable[`${wd}-${b.period}`] === ui.sectionId;
      const done = !!state.sessions[sessionKey(ui.sectionId, ui.date, b.period)];
      const cls = ['chip', b.period === ui.period && 'on', isTT && 'tt', done && 'done'].filter(Boolean).join(' ');
      return `<button class="${cls}" data-p="${b.period}" title="${b.start}–${b.end}">${b.period}교시</button>`;
    }).join('');
  }

  function renderSessionBar() {
    const key = currentKey();
    const sess = state.sessions[key];
    const list = studentsOf(ui.sectionId);
    const bar = $('#sessionBar');

    // 기록 전후로 바 높이가 같아야 카드가 밀리지 않는다(밀리면 터치가 다른 버튼에 맞는다)
    if (!sess) {
      bar.innerHTML = `
        <div class="bar-top">
          <span class="state off">아직 기록 전입니다</span>
          <button class="btn primary" id="markAll">전원 출석으로 기록</button>
        </div>
        <input class="memo-input" placeholder="기록을 시작하면 메모를 남길 수 있습니다" disabled>`;
      return;
    }

    const counts = { present: 0 };
    COUNTED.forEach((t) => (counts[t] = 0));
    list.forEach((s) => { const r = recordOf(key, s.id); counts[r ? r.type : 'present']++; });
    const pills = ['present', ...COUNTED]
      .filter((t) => t === 'present' || counts[t])
      .map((t) => `<span class="pill"><i class="dot" style="background:var(--st-${t})"></i>${TYPES[t].label} ${counts[t]}</span>`)
      .join('');
    const allIn = counts.present === list.length;

    bar.innerHTML = `
      <div class="bar-top">
        <div class="counts">${allIn ? '<img class="slot slot-badge" src="assets/img/all-present.png" alt="전원 출석" data-fallback="🎉">' : ''}${pills}</div>
        <button class="btn ghost" id="clearSession" aria-label="이 수업 기록 삭제">기록 삭제</button>
      </div>
      <input class="memo-input" id="memoInput" placeholder="수업 메모 (진도, 특이사항)" value="${esc(sess.memo || '')}">`;
    wireSlots(bar);
  }

  function renderGrid() {
    const key = currentKey();
    const list = studentsOf(ui.sectionId);
    if (!list.length) {
      $('#studentGrid').innerHTML = `<li class="empty card" style="grid-column:1/-1">
        <img class="slot slot-empty" src="assets/img/empty-roster.png" alt="" data-fallback="🧑‍🎓">
        <b>이 분반에 학생이 없습니다</b><p class="muted">설정 → 명렬표에서 학생을 추가하십시오.</p></li>`;
      wireSlots($('#studentGrid'));
      return;
    }
    $('#studentGrid').innerHTML = list.map((s) => {
      const r = recordOf(key, s.id);
      const type = r ? r.type : 'present';
      const tag = r ? (r.type === 'excused' ? '인정' : `${(REASONS[r.reason] || '')} ${TYPES[r.type].short}`.trim()) : '';
      return `<li><button class="stu" data-id="${esc(s.id)}" data-type="${type}" aria-label="${esc(s.name)} ${TYPES[type].label}">
        <span class="tag">${esc(tag)}</span>
        <span class="nm">${esc(s.name)}</span>
        <span class="no">${esc(s.studentNo)}</span>
      </button></li>`;
    }).join('');
  }

  function updateCard(studentId) {
    const btn = document.querySelector(`.stu[data-id="${CSS.escape(studentId)}"]`);
    if (!btn) return renderGrid();
    const r = recordOf(currentKey(), studentId);
    const type = r ? r.type : 'present';
    btn.dataset.type = type;
    btn.querySelector('.tag').textContent = r ? (r.type === 'excused' ? '인정' : `${(REASONS[r.reason] || '')} ${TYPES[r.type].short}`.trim()) : '';
    btn.setAttribute('aria-label', `${btn.querySelector('.nm').textContent} ${TYPES[type].label}`);
  }

  function changeStudent(studentId, next) {
    const key = currentKey();
    const prev = recordOf(key, studentId);
    const hadSession = !!state.sessions[key];
    setRecord(key, studentId, next);
    updateCard(studentId);
    renderSessionBar();
    if (!hadSession) renderChips(); // 카드는 다시 그리지 않는다(누르고 있는 요소가 사라지지 않게)
    const stu = state.students.find((s) => s.id === studentId);
    const label = next && next.type !== 'present' ? cellLabel(next) : '출석';
    toast(`${stu.name} · ${label}`, {
      label: '되돌리기',
      run: () => { setRecord(key, studentId, prev); updateCard(studentId); renderSessionBar(); },
    });
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function cycleStudent(studentId) {
    const r = recordOf(currentKey(), studentId);
    const cur = r ? r.type : 'present';
    const i = TAP_CYCLE.indexOf(cur);
    const nextType = i === -1 ? 'present' : TAP_CYCLE[(i + 1) % TAP_CYCLE.length];
    changeStudent(studentId, nextType === 'present' ? null : { type: nextType, reason: (r && r.reason) || DEFAULT_REASON, note: '' });
  }

  // 탭 / 길게 누르기
  function wireGrid() {
    const grid = $('#studentGrid');
    let timer = null, startX = 0, startY = 0, target = null, longFired = false;

    grid.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.stu');
      if (!btn || e.button > 0) return;
      target = btn; longFired = false; startX = e.clientX; startY = e.clientY;
      btn.classList.add('pressing');
      timer = setTimeout(() => {
        longFired = true;
        btn.classList.remove('pressing');
        openSheet(btn.dataset.id);
      }, LONG_PRESS_MS);
    });
    grid.addEventListener('pointermove', (e) => {
      if (!target) return;
      if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) cancel();
    });
    const cancel = () => { clearTimeout(timer); if (target) target.classList.remove('pressing'); target = null; };
    grid.addEventListener('pointerup', (e) => {
      if (!target) return;
      const btn = target;
      cancel();
      if (!longFired && e.target.closest('.stu') === btn) cycleStudent(btn.dataset.id);
    });
    // 탭은 pointerup 에서 처리했으므로 브라우저가 뒤이어 만드는 click 은 막는다
    grid.addEventListener('touchend', (e) => { if (e.target.closest('.stu')) e.preventDefault(); }, { passive: false });
    grid.addEventListener('pointercancel', cancel);
    grid.addEventListener('pointerleave', cancel);
    grid.addEventListener('contextmenu', (e) => {
      const btn = e.target.closest('.stu');
      if (!btn) return;
      e.preventDefault();
      if (!longFired) openSheet(btn.dataset.id); // 마우스 오른쪽 클릭
    });
    // 키보드(Enter/Space)는 click 으로만 들어온다
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.stu');
      if (btn && e.detail === 0) cycleStudent(btn.dataset.id);
    });
    grid.addEventListener('keydown', (e) => {
      const btn = e.target.closest('.stu');
      if (btn && (e.key === 'm' || (e.key === 'Enter' && e.shiftKey))) { e.preventDefault(); openSheet(btn.dataset.id); }
    });
  }

  // ── 상태 시트 ─────────────────────────────
  function openSheet(studentId) {
    const stu = state.students.find((s) => s.id === studentId);
    const r = recordOf(currentKey(), studentId);
    ui.sheet = { studentId, type: r ? r.type : 'present', reason: (r && r.reason) || DEFAULT_REASON };
    $('#sheetTitle').textContent = `${stu.name} (${stu.studentNo})`;
    $('#noteInput').value = (r && r.note) || '';
    renderSheet();
    $('#toast').classList.remove('show');
    $('#sheet').hidden = false;
    if (navigator.vibrate) navigator.vibrate(20);
  }
  function renderSheet() {
    const s = ui.sheet;
    $('#typeChoices').innerHTML = Object.entries(TYPES).map(([k, t]) =>
      `<button data-k="${k}" class="${s.type === k ? 'on' : ''}" style="background:var(--st-${k})">${t.label}</button>`).join('');
    const needReason = !['present', 'excused'].includes(s.type);
    $('#reasonLabel').style.opacity = needReason ? 1 : .35;
    $('#reasonChoices').innerHTML = Object.entries(REASONS).map(([k, label]) =>
      `<button data-k="${k}" class="${needReason && s.reason === k ? 'on' : ''}" ${needReason ? '' : 'disabled'}>${label}</button>`).join('');
  }
  function closeSheet() { $('#sheet').hidden = true; ui.sheet = null; }

  // ── 통계 ─────────────────────────────
  function tally(sectionId, from, to) {
    const keys = Object.keys(state.sessions).filter((k) => {
      const s = state.sessions[k];
      return s.sectionId === sectionId && (!from || s.date >= from) && (!to || s.date <= to);
    });
    const rows = studentsOf(sectionId).map((stu) => {
      const c = { stu, unexcused: 0, events: [] };
      COUNTED.forEach((t) => (c[t] = 0));
      keys.forEach((k) => {
        const r = recordOf(k, stu.id);
        if (!r) return;
        c[r.type]++;
        if (r.reason === 'unexcused' && r.type !== 'excused') c.unexcused++;
        c.events.push({ key: k, ...state.sessions[k], rec: r });
      });
      return c;
    });
    return { keys, rows };
  }

  function renderStats() {
    segTabs($('#statsTabs'), ui.statsSection, (id) => { ui.statsSection = id; renderStats(); }, false);
    const { keys, rows } = tally(ui.statsSection);
    const n = rows.length;
    const missed = rows.reduce((a, r) => a + r.absent + r.absentClass, 0);
    const rate = keys.length && n ? Math.round((1 - missed / (keys.length * n)) * 1000) / 10 : 0;
    const unexcused = rows.reduce((a, r) => a + r.unexcused, 0);

    $('#statsSummary').innerHTML = `
      <div><b>${keys.length}</b><span>기록한 수업</span></div>
      <div><b>${keys.length ? rate + '%' : '–'}</b><span>출석률</span></div>
      <div><b>${unexcused}</b><span>미인정 누계</span></div>`;

    if (!keys.length) {
      $('#statsTable').innerHTML = `<tbody><tr><td colspan="7" class="empty" style="text-align:center">
        <img class="slot slot-empty" src="assets/img/stats-empty.png" alt="" data-fallback="📊">
        <b>아직 기록한 수업이 없습니다</b><p class="muted">출석부에서 첫 수업을 기록하면 여기에 쌓입니다.</p></td></tr></tbody>`;
      wireSlots($('#statsTable'));
      return;
    }

    rows.sort((a, b) => b.unexcused - a.unexcused || (b.absent + b.absentClass) - (a.absent + a.absentClass) || a.stu.studentNo.localeCompare(b.stu.studentNo));
    const cell = (v, hot) => `<td class="${v ? (hot ? 'hot' : '') : 'zero'}">${v}</td>`;
    $('#statsTable').innerHTML = `
      <thead><tr><th>학생</th><th>지각</th><th>조퇴</th><th>결과</th><th>결석</th><th>인정</th><th>미인정</th></tr></thead>
      <tbody>${rows.map((r) => `<tr data-id="${esc(r.stu.id)}">
        <td><b>${esc(r.stu.name)}</b> <span class="muted" style="font-size:12px">${esc(r.stu.studentNo)}</span></td>
        ${cell(r.late)}${cell(r.early)}${cell(r.absentClass)}${cell(r.absent)}${cell(r.excused)}${cell(r.unexcused, true)}
      </tr>`).join('')}</tbody>`;
  }

  function openHistory(studentId) {
    const stu = state.students.find((s) => s.id === studentId);
    const row = tally(stu.sectionId).rows.find((r) => r.stu.id === studentId);
    const events = row.events.sort((a, b) => (b.date + b.period).localeCompare(a.date + a.period));
    $('#historyTitle').textContent = `${stu.name} 출결 이력`;
    $('#historyList').innerHTML = events.length
      ? events.map((e) => `<li><span>${prettyDate(e.date)} ${e.period}교시</span><b>${esc(cellLabel(e.rec))}${e.rec.note ? ` · ${esc(e.rec.note)}` : ''}</b></li>`).join('')
      : '<li class="empty">모든 수업에 출석했습니다.</li>';
    $('#history').hidden = false;
  }

  // ── 내보내기 ─────────────────────────────
  function renderExport() {
    const sel = $('#exSection');
    if (!sel.options.length) {
      sel.innerHTML = state.sections.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('') + '<option value="all">전체</option>';
      const dates = Object.values(state.sessions).map((s) => s.date).sort();
      $('#exFrom').value = dates[0] || addDays(today(), -30);
      $('#exTo').value = today();
    }
    wireSlots($('#view-export'));
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function csvEscape(v) {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    const from = $('#exFrom').value, to = $('#exTo').value;
    const which = $('#exSection').value;
    const sections = which === 'all' ? state.sections.map((s) => s.id) : [which];
    const lines = [];

    sections.forEach((sid, si) => {
      const { keys, rows } = tally(sid, from, to);
      keys.sort((a, b) => {
        const A = state.sessions[a], B = state.sessions[b];
        return (A.date + A.period).localeCompare(B.date + B.period);
      });
      if (si > 0) lines.push('');
      lines.push(csvEscape(`${sectionName(sid)} (${from} ~ ${to})`));
      const head = ['순번', '학번', '이름',
        ...keys.map((k) => { const s = state.sessions[k]; const d = parseYmd(s.date); return `${d.getMonth() + 1}/${d.getDate()} ${s.period}교시`; }),
        '지각', '조퇴', '결과', '결석', '출석인정', '미인정 합계'];
      lines.push(head.map(csvEscape).join(','));
      rows.sort((a, b) => a.stu.studentNo.localeCompare(b.stu.studentNo)).forEach((r, i) => {
        lines.push([i + 1, r.stu.studentNo, r.stu.name,
          ...keys.map((k) => cellLabel(recordOf(k, r.stu.id))),
          r.late, r.early, r.absentClass, r.absent, r.excused, r.unexcused].map(csvEscape).join(','));
      });
      const memoRow = ['', '', '수업 메모', ...keys.map((k) => state.sessions[k].memo || '')];
      if (memoRow.slice(3).some(Boolean)) lines.push(memoRow.map(csvEscape).join(','));
    });

    const label = which === 'all' ? '전체' : sectionName(which);
    download(`공학일반_${label}_출결_${from}_${to}.csv`, '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV 파일을 내려받았습니다.');
  }

  function backup() {
    download(`공학일반_출석부_백업_${today()}.json`, JSON.stringify(state, null, 2), 'application/json');
    toast('백업 파일을 저장했습니다.');
  }

  async function restore(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.students) || typeof data.sessions !== 'object') throw new Error('형식 오류');
      const n = Object.keys(data.sessions).length;
      if (!confirm(`백업(${n}개 수업 기록)으로 현재 데이터를 덮어쓰시겠습니까?`)) return;
      state = data;
      await window.AppStore.save(state);
      toast('백업을 불러왔습니다.');
      render();
    } catch (e) {
      toast('백업 파일을 읽지 못했습니다.');
    }
  }

  // ── 설정 ─────────────────────────────
  function renderSettings() {
    // 시간표: 행 = 교시, 열 = 월~금
    const days = [1, 2, 3, 4, 5];
    $('#ttTable').innerHTML = `<thead><tr><th></th>${days.map((d) => `<th>${WEEKDAYS[d]}</th>`).join('')}</tr></thead>
      <tbody>${state.bells.map((b) => `<tr><th>${b.period}</th>${days.map((d) => {
        const v = state.timetable[`${d}-${b.period}`] || '';
        return `<td><button data-k="${d}-${b.period}" data-v="${v}">${v ? esc(sectionName(v)) : ''}</button></td>`;
      }).join('')}</tr>`).join('')}</tbody>`;

    $('#bellList').innerHTML = state.bells.map((b, i) => `<div class="bell">
      <span>${b.period}교시</span>
      <input type="time" data-i="${i}" data-f="start" value="${b.start}" aria-label="${b.period}교시 시작">
      <input type="time" data-i="${i}" data-f="end" value="${b.end}" aria-label="${b.period}교시 종료">
    </div>`).join('');

    segTabs($('#rosterTabs'), ui.rosterSection, (id) => { ui.rosterSection = id; renderSettings(); }, true);
    $('#rosterList').innerHTML = studentsOf(ui.rosterSection).map((s) =>
      `<li><span>${esc(s.studentNo)} <b>${esc(s.name)}</b></span><button class="x" data-id="${esc(s.id)}">삭제</button></li>`).join('');
  }

  function addStudent(no, name, sectionId) {
    no = String(no).trim(); name = String(name).trim();
    if (!/^\d{5}$/.test(no) || !name) return 'invalid';
    const existing = state.students.find((s) => s.studentNo === no);
    if (existing && existing.active) return 'dup';
    if (existing) Object.assign(existing, { name, sectionId, active: true });
    else state.students.push({ id: no, studentNo: no, name, sectionId, active: true });
    return 'ok';
  }

  // ── 이벤트 연결 ─────────────────────────────
  function wire() {
    $('#tabbar').onclick = (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.view); };
    $('#todayBtn').onclick = () => { autoSelect(); renderRoll(); toast('오늘 현재 수업으로 이동했습니다.'); };

    $('#prevDay').onclick = () => { ui.date = addDays(ui.date, -1); renderRoll(); };
    $('#nextDay').onclick = () => { ui.date = addDays(ui.date, 1); renderRoll(); };
    $('#dateInput').onchange = (e) => { if (e.target.value) { ui.date = e.target.value; renderRoll(); } };
    $('#periodChips').onclick = (e) => { const b = e.target.closest('.chip'); if (b) { ui.period = Number(b.dataset.p); renderRoll(); } };

    $('#sessionBar').addEventListener('click', (e) => {
      if (e.target.id === 'markAll') {
        ensureSession(currentKey()); persist(); renderRoll();
        toast('전원 출석으로 기록했습니다.');
      }
      if (e.target.id === 'clearSession') {
        if (!confirm('이 수업의 기록을 지우시겠습니까? 통계에서도 빠집니다.')) return;
        const key = currentKey();
        delete state.sessions[key]; delete state.records[key];
        persist(); renderRoll();
      }
    });
    $('#sessionBar').addEventListener('input', (e) => {
      if (e.target.id !== 'memoInput') return;
      state.sessions[currentKey()].memo = e.target.value;
      persist();
    });

    wireGrid();

    // 시트
    $('#typeChoices').onclick = (e) => { const b = e.target.closest('button'); if (b) { ui.sheet.type = b.dataset.k; renderSheet(); } };
    $('#reasonChoices').onclick = (e) => { const b = e.target.closest('button'); if (b && !b.disabled) { ui.sheet.reason = b.dataset.k; renderSheet(); } };
    $('#sheetCancel').onclick = closeSheet;
    $('#sheet').onclick = (e) => { if (e.target.id === 'sheet') closeSheet(); };
    $('#sheetSave').onclick = () => {
      const s = ui.sheet;
      const note = $('#noteInput').value.trim();
      const rec = s.type === 'present' ? null : { type: s.type, reason: s.type === 'excused' ? null : s.reason, note };
      closeSheet();
      changeStudent(s.studentId, rec);
    };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); $('#history').hidden = true; } });

    // 통계
    $('#statsTable').onclick = (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) openHistory(tr.dataset.id); };
    $('#historyClose').onclick = () => ($('#history').hidden = true);
    $('#history').onclick = (e) => { if (e.target.id === 'history') e.target.hidden = true; };

    // 내보내기
    $('#exportCsv').onclick = exportCsv;
    $('#backupBtn').onclick = backup;
    $('#restoreInput').onchange = (e) => { const f = e.target.files[0]; if (f) restore(f); e.target.value = ''; };

    // 설정
    $('#ttTable').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const order = ['', ...state.sections.map((s) => s.id)];
      const next = order[(order.indexOf(b.dataset.v) + 1) % order.length];
      if (next) state.timetable[b.dataset.k] = next; else delete state.timetable[b.dataset.k];
      persist(); renderSettings();
    };
    $('#bellList').onchange = (e) => {
      const i = e.target.dataset.i; if (i == null || !e.target.value) return;
      state.bells[i][e.target.dataset.f] = e.target.value;
      persist();
    };
    $('#rosterList').onclick = (e) => {
      const b = e.target.closest('.x'); if (!b) return;
      const stu = state.students.find((s) => s.id === b.dataset.id);
      if (!confirm(`${stu.name} 학생을 명렬표에서 빼시겠습니까? 지난 기록은 남습니다.`)) return;
      stu.active = false; persist(); renderSettings();
    };
    $('#addStudent').onclick = () => {
      const res = addStudent($('#newNo').value, $('#newName').value, ui.rosterSection);
      if (res === 'invalid') return toast('학번 5자리와 이름을 입력하십시오.');
      if (res === 'dup') return toast('이미 등록된 학번입니다.');
      $('#newNo').value = ''; $('#newName').value = '';
      persist(); renderSettings(); toast('학생을 추가했습니다.');
    };
    $('#clearSection').onclick = () => {
      const list = studentsOf(ui.rosterSection);
      if (!list.length) return;
      if (!confirm(`${sectionName(ui.rosterSection)} 학생 ${list.length}명을 모두 빼시겠습니까? 지난 기록은 남습니다.`)) return;
      list.forEach((s) => (s.active = false));
      persist(); renderSettings(); toast(`${list.length}명을 뺐습니다.`);
    };
    $('#bulkAdd').onclick = () => {
      let ok = 0, bad = 0;
      $('#bulkText').value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const m = line.match(/(\d{5})[\s,\t]+(\S+)/);
        if (m && addStudent(m[1], m[2], ui.rosterSection) === 'ok') ok++; else bad++;
      });
      $('#bulkText').value = '';
      persist(); renderSettings();
      toast(`${ok}명 추가${bad ? `, ${bad}줄 건너뜀` : ''}`);
    };
    $('#resetAll').onclick = async () => {
      if (!confirm('모든 출결 기록과 설정을 지우시겠습니까?')) return;
      if (!confirm('되돌릴 수 없습니다. 정말 초기화하시겠습니까?')) return;
      state = await window.AppStore.reset();
      toast('초기화했습니다.'); render();
    };
  }

  // ── 시작 ─────────────────────────────
  async function boot() {
    try {
      state = await window.AppStore.load();
    } catch (e) {
      console.error(e);
      state = window.seedState();
      toast('저장소를 열지 못해 임시 데이터로 시작합니다.');
    }
    $('#storeLabel').textContent = window.AppStore.label;
    autoSelect();
    wireSlots(document);
    wire();
    show('roll');

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // 테스트에서 쓰도록 노출
  window.__attendance = { get state() { return state; }, ui, tally, cellLabel, exportCsv, addStudent };

  boot();
})();
