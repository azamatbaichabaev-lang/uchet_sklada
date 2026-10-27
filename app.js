/* Учёт долгов — страница. Работает с мини-сервером (config.js → API_URL) или в демо-режиме. */
(function () {
  'use strict';

  var API = ((window.APP_CONFIG && window.APP_CONFIG.API_URL) || '').trim();
  var DEMO = !API;
  var LOCAL = window.LOCAL_DATA || null; // проверка на выгрузке из МоегоСклада
  var LS_KEY = 'debts_session_v1';
  var STEP = 5;
  // внутри Claude файлы скачиваются через окно подтверждения; на GitHub — обычным способом
  var claudeDl = null;
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (d) { claudeDl = d; }, function () {});
  }

  var ICONS = {"users": "<path d=\"M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" /> <path d=\"M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" /> <path d=\"M21 21v-2a4 4 0 0 0 -3 -3.85\" />", "eye-off": "<path d=\"M10.585 10.587a2 2 0 0 0 2.829 2.828\" /> <path d=\"M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87\" /> <path d=\"M3 3l18 18\" />", "trash": "<path d=\"M4 7l16 0\" /> <path d=\"M10 11l0 6\" /> <path d=\"M14 11l0 6\" /> <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" /> <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" />", "user-plus": "<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M16 19h6\" /> <path d=\"M19 16v6\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4\" />", "x": "<path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" />", "device-mobile": "<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\" /> <path d=\"M11 4h2\" /> <path d=\"M12 17v.01\" />", "device-desktop": "<path d=\"M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z\" /> <path d=\"M7 20h10\" /> <path d=\"M9 16v4\" /> <path d=\"M15 16v4\" />","lock": "<path d=\"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z\" /> <path d=\"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0\" /> <path d=\"M8 11v-4a4 4 0 1 1 8 0v4\" />", "logout": "<path d=\"M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2\" /> <path d=\"M9 12h12l-3 -3\" /> <path d=\"M18 15l3 -3\" />", "eye": "<path d=\"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /> <path d=\"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6\" />", "zoom-in": "<path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" /> <path d=\"M7 10l6 0\" /> <path d=\"M10 7l0 6\" /> <path d=\"M21 21l-6 -6\" />", "crown": "<path d=\"M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z\" />", "search": "<path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" /> <path d=\"M21 21l-6 -6\" />", "chevron-down": "<path d=\"M6 9l6 6l6 -6\" />", "chevron-up": "<path d=\"M6 15l6 -6l6 6\" />", "truck": "<path d=\"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5\" />", "building-factory-2": "<path d=\"M3 21h18\" /> <path d=\"M5 21v-12l5 4v-4l5 4h4\" /> <path d=\"M19 21v-8l-1.436 -9.574a.5 .5 0 0 0 -.495 -.426h-1.145a.5 .5 0 0 0 -.494 .418l-1.43 8.582\" /> <path d=\"M9 17h1\" /> <path d=\"M14 17h1\" />", "package": "<path d=\"M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5\" /> <path d=\"M12 12l8 -4.5\" /> <path d=\"M12 12l0 9\" /> <path d=\"M12 12l-8 -4.5\" /> <path d=\"M16 5.25l-8 4.5\" />", "currency-dollar": "<path d=\"M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2\" /> <path d=\"M12 3v3m0 12v3\" />", "currency-rubel": "<path d=\"M8 19v-14h6a3 3 0 0 1 0 6h-8\" /> <path d=\"M14 15h-8\" />", "file-spreadsheet": "<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" /> <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" /> <path d=\"M8 11h8v7h-8z\" /> <path d=\"M8 15h8\" /> <path d=\"M11 11v7\" />", "check": "<path d=\"M5 12l5 5l10 -10\" />", "calendar": "<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\" /> <path d=\"M16 3v4\" /> <path d=\"M8 3v4\" /> <path d=\"M4 11h16\" /> <path d=\"M11 15h1\" /> <path d=\"M12 15v3\" />", "arrow-right": "<path d=\"M5 12l14 0\" /> <path d=\"M13 18l6 -6\" /> <path d=\"M13 6l6 6\" />", "arrow-back-up": "<path d=\"M9 14l-4 -4l4 -4\" /> <path d=\"M5 10h11a4 4 0 1 1 0 8h-1\" />", "box": "<path d=\"M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5\" /> <path d=\"M12 12l8 -4.5\" /> <path d=\"M12 12l0 9\" /> <path d=\"M12 12l-8 -4.5\" />", "refresh": "<path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4\" /> <path d=\"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4\" />", "alert-triangle": "<path d=\"M12 9v4\" /> <path d=\"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z\" /> <path d=\"M12 16h.01\" />"};

  /* ---------- форматирование ---------- */
  var MS_ = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var MN = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var MG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var THIS_YEAR = new Date().getFullYear();

  function ic(n, s) { var z = s || 20; return '<svg class="ic" width="' + z + '" height="' + z + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function usd(n) { return Math.round(Math.abs(n)).toLocaleString('ru-RU') + ' $'; }
  function usd2(n) { return r2(Math.abs(n)).toLocaleString('ru-RU') + ' $'; }
  function nf(n) { return Number(n).toLocaleString('ru-RU'); }
  function dp(s) { var p = s.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function dShort(s) { var x = dp(s); return x.d + ' ' + MS_[x.m] + (x.y !== THIS_YEAR ? ' ' + x.y : ''); }
  function dFull(s) { var p = s.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function monthName(k) { var x = dp(k + '-01'); return MN[x.m] + (x.y !== THIS_YEAR ? ' ' + x.y : ''); }
  function monthGen(k) { var x = dp(k + '-01'); return MG[x.m] + (x.y !== THIS_YEAR ? ' ' + x.y : ''); }
  function isoOf(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function plural(n, f) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return f[0]; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1]; return f[2]; }
  function curSign(c) { return c === 'RUB' ? '₽' : c === 'USD' ? '$' : c; }

  /* ---------- группы и роли ---------- */
  var GR = {
    clients: { doc: false, title: 'Клиенты должны нам', other: 'Мы должны', forms: ['клиенту', 'клиентам', 'клиентам'], pos: 'должен', neg: 'мы должны', inL: 'Отгрузка', inI: 'truck', unit: 'шт' },
    factories: { doc: true, title: 'Мы должны фабрикам', other: 'Нам должны', forms: ['фабрика', 'фабрики', 'фабрик'], pos: 'мы должны', neg: 'должны нам', inL: 'Поставка товара', inI: 'building-factory-2', unit: 'шт' },
    cargo: { doc: true, title: 'Мы должны карго', other: 'Нам должны', forms: ['карго', 'карго', 'карго'], pos: 'мы должны', neg: 'должны нам', inL: 'Доставка партии', inI: 'package', unit: 'кг' }
  };
  var ROLE = {
    view: ['Только просмотр', 'eye', '#D3EADC', '#0F6E56'],
    full: ['Полный доступ', 'zoom-in', '#E6F1FB', '#0C447C'],
    owner: ['Владелец', 'crown', '#FAEEDA', '#854F0B']
  };

  /* ---------- состояние ---------- */
  var S = {
    session: null, user: null, data: null, loading: false, error: '', loginErr: '',
    grp: 'clients', q: '', open: null, openOp: null, dl: null,
    lim: STEP, period: null, calOpen: false, rFrom: '', rTo: '', rErr: '',
    screen: 'main', uList: null, uRo: false, uLoading: false, uMsg: '', uMsgOk: false
  };
  function resetCard() { S.openOp = null; S.dl = null; S.lim = STEP; S.period = null; S.calOpen = false; S.rFrom = ''; S.rTo = ''; S.rErr = ''; }
  function store(v) { try { if (v) localStorage.setItem(LS_KEY, JSON.stringify(v)); else localStorage.removeItem(LS_KEY); } catch (e) {} }
  function restore() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }

  /* ---------- связь с сервером ---------- */
  function api(body) {
    if (DEMO) return demoApi(body);
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var e = new Error(j.error || ('Ошибка ' + r.status)); e.status = r.status; throw e; }
          return j;
        });
      });
  }

  function login(code) {
    S.loginErr = '';
    api({ action: 'login', code: code }).then(function (j) {
      S.session = j.session; S.user = j.user; store({ session: j.session, user: j.user });
      S.open = null; resetCard(); loadData();
    }).catch(function (e) {
      S.loginErr = e.status === 401 ? 'Неверный код' : (e.message || 'Нет связи с сервером');
      render(); var p = document.getElementById('pin'); if (p) { p.focus(); p.select(); }
    });
  }

  function logout() { store(null); S.session = null; S.user = null; S.data = null; S.open = null; resetCard(); render(); }

  function loadData() {
    S.loading = true; S.error = ''; render();
    api({ action: 'data', session: S.session }).then(function (j) {
      S.loading = false; S.user = j.user; S.data = j; store({ session: S.session, user: j.user }); render();
    }).catch(function (e) {
      S.loading = false;
      if (e.status === 401) { store(null); S.session = null; S.user = null; S.loginErr = 'Нужно войти заново'; }
      else S.error = e.message || 'Нет связи с сервером';
      render();
    });
  }

  /* ---------- расчёт истории ---------- */
  function prep(c) {
    if (c._p) return c._p;
    var bal = 0;
    c._p = (c.ops || []).map(function (o, i) {
      var x = {}; for (var k in o) x[k] = o[k];
      x.i = i; x.before = bal; bal = r2(bal + o.delta); x.after = bal; return x;
    });
    return c._p;
  }
  function byMonth(ops) {
    var res = [], cur = null;
    ops.forEach(function (o) { var k = o.date.slice(0, 7); if (!cur || cur.k !== k) { cur = { k: k, ops: [] }; res.push(cur); } cur.ops.push(o); });
    return res;
  }
  function newestFirst(ops, withBal) {
    var ms = byMonth(ops), out = [];
    for (var i = ms.length - 1; i >= 0; i--) {
      out.push({ t: 'm', k: ms[i].k });
      for (var j = ms[i].ops.length - 1; j >= 0; j--) out.push({ t: 'o', o: ms[i].ops[j] });
      if (withBal && i > 0) out.push({ t: 'b', k: ms[i].k, v: ms[i].ops[0].before });
    }
    return out;
  }
  function qty(o) { var q = 0; (o.items || []).forEach(function (x) { if (x.u === 'шт' || x.u === 'кг') q += x.q; }); return q; }
  function unitOf(o, g) { var u = g.unit; (o.items || []).forEach(function (x) { if (x.u === 'шт' || x.u === 'кг') u = x.u; }); return u; }

  /* ---------- Excel ---------- */
  function clean(s) { return String(s).replace(/[«»"]/g, '').replace(/[\\/:*?<>|]/g, '-').trim().replace(/\s+/g, '_'); }
  function fileName(g, c, o) {
    var q = qty(o), u = unitOf(o, g);
    if (g.doc) return '№' + clean(o.num) + '_' + dFull(o.date) + '_' + q + u + (o.places ? '_' + o.places + 'мест' : '') + '.xlsx';
    return clean(c.name) + '_' + dFull(o.date) + '_' + q + u + '.xlsx';
  }
  function downloadExcel(g, c, o) {
    if (!window.XLSX) { alertBox('Excel ещё загружается, нажмите через секунду'); return Promise.resolve(false); }
    var rows = [['Накладная'], ['Контрагент', c.name], ['Дата', dFull(o.date)], ['Документ', '№' + o.num]];
    if (o.places) rows.push(['Мест', o.places]);
    rows.push([]); rows.push(['Товар', 'Кол-во', 'Ед.', 'Цена, $', 'Сумма, $']);
    var tq = 0, ts = 0;
    (o.items || []).forEach(function (x) { var s = r2(x.q * x.p); ts += s; if (x.u === 'шт' || x.u === 'кг') tq += x.q; rows.push([x.n, x.q, x.u, x.p, s]); });
    rows.push(['Итого', tq, '', '', r2(ts)]);
    var ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = [{ wch: 26 }, { wch: 10 }, { wch: 6 }, { wch: 10 }, { wch: 12 }];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Накладная');
    var bytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var name = fileName(g, c, o);
    if (claudeDl) {
      return claudeDl.save({ filename: name, data: blob }).then(function () { return true; }, function (e) {
        if (e && e.code !== 'declined') alertBox('Не удалось скачать файл');
        return false;
      });
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return Promise.resolve(true);
  }
  function alertBox(t) { S.error = t; render(); setTimeout(function () { if (S.error === t) { S.error = ''; render(); } }, 2500); }

  /* ---------- отрисовка: вход ---------- */
  function viewLogin() {
    var h = '<div class="login"><div class="lock">' + ic('lock', 30) + '</div>' +
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">Учёт долгов</div>' +
      '<div style="font-size:13px;color:var(--sub);margin-bottom:16px">Введите свой код доступа</div>' +
      '<label class="sr" for="pin">Код доступа</label>' +
      '<input id="pin" class="field pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="••••"' + (S.loginErr ? ' style="border-color:var(--red)"' : '') + '>' +
      '<div class="err" id="pinErr">' + esc(S.loginErr) + '</div>' +
      '<button class="btn btn-pri" style="width:100%;height:48px;margin-top:4px;font-size:15px" data-act="login">Войти</button>';
    if (DEMO) h += '<div class="note" style="margin-top:18px;background:#FAEEDA;color:#633806;text-align:left">' + (LOCAL ? 'Проверка на ваших данных из МоегоСклада (файл только на этом компьютере).' : 'Демо-режим: сервер ещё не подключён, данные примерные.') + ' Коды для проверки: <b>1111</b> — владелец, <b>2222</b> — полный доступ, <b>3333</b> — только просмотр.</div>';
    return h + '</div>';
  }

  /* ---------- отрисовка: главный экран ---------- */
  function viewMain() {
    var R = ROLE[S.user.role] || ROLE.view;
    var h = '<div class="top">' +
      '<button class="iconbtn" data-act="logout" aria-label="Выйти" title="Выйти" style="color:' + R[3] + '">' + ic('logout', 22) + '</button>' +
      (S.user.role === 'owner' ? '<button class="iconbtn" data-act="users" aria-label="Пользователи и коды" title="Пользователи и коды" style="' + (S.screen === 'users' ? 'background:#854F0B;color:#fff;border-color:#854F0B' : 'color:#854F0B;border-color:#EFCB8F') + '">' + ic('users', 22) + '</button>' : '') +
      '<span class="who" title="' + R[0] + '" style="background:' + R[2] + ';color:' + R[3] + '">' + ic(R[1], 16) + '<span>' + esc(S.user.name) + '</span></span>' +
      '<span class="grow"></span>' +
      '<button class="iconbtn" data-act="reload" aria-label="Обновить" title="Обновить">' + ic('refresh', 20).replace('class="ic"', 'class="ic' + (S.loading ? ' spin' : '') + '"') + '</button></div>';
    if (S.screen === 'users') return h + viewUsers();
    if (DEMO) h += '<div class="note" style="background:#FAEEDA;color:#633806;margin-bottom:10px">' + (LOCAL ? 'Проверка: данные из МоегоСклада на момент выгрузки' : 'Демо-режим: данные примерные') + '</div>';
    if (S.error) h += '<div class="note" style="background:var(--red-bg);color:var(--red);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px"><span>' + esc(S.error) + '</span><button class="btn" data-act="reload" style="height:36px">Повторить</button></div>';
    h += '<label class="label" for="grp">Группа контрагентов</label>' +
      '<select id="grp" class="field">' +
      ['clients', 'factories', 'cargo'].map(function (k) { return '<option value="' + k + '"' + (S.grp === k ? ' selected' : '') + '>' + ({ clients: 'Клиенты', factories: 'Фабрики', cargo: 'Карго' })[k] + '</option>'; }).join('') +
      '</select>';
    if (!S.data) return h + '<div class="foot" style="padding:40px 0">' + (S.loading ? 'Загружаю данные…' : '') + '</div>';
    h += '<div id="sum">' + viewSum() + '</div>' +
      '<div class="search">' + ic('search', 18) + '<label class="sr" for="q">Поиск по имени</label><input id="q" class="field" type="search" placeholder="Поиск по имени" value="' + esc(S.q) + '" autocomplete="off"></div>' +
      '<div id="list" class="list">' + viewList() + '</div>' +
      '<div class="foot">Обновлено ' + new Date(S.data.updated).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</div>';
    return h;
  }

  function viewSum() {
    var g = GR[S.grp], items = S.data.groups[S.grp] || [], tot = 0, n = 0, oth = 0, on = 0;
    items.forEach(function (c) { if (c.balance > 0) { tot += c.balance; n++; } else if (c.balance < 0) { oth -= c.balance; on++; } });
    var top = g.doc ? 'var(--sum-red)' : 'var(--sum-green)', bot = g.doc ? 'var(--sum-green)' : 'var(--sum-red)';
    var l1 = g.doc ? '#F7DADA' : '#D7EFE3', l2 = g.doc ? '#EBB9B9' : '#B9DCC8', b1 = g.doc ? '#D7EFE3' : '#F7DADA';
    var h = '<div class="sum"><div class="sum-row sum-top" style="background:' + top + '"><div><div style="font-size:13px;color:' + l1 + '">' + g.title + '</div><div style="font-size:12px;color:' + l2 + ';margin-top:2px">' + n + ' из ' + items.length + ' с долгом</div></div><div class="sum-big">' + (g.doc ? '−' : '+') + usd(tot) + '</div></div>';
    if (oth > 0) h += '<div class="sum-row sum-bot" style="background:' + bot + '"><span style="font-size:13px;color:' + b1 + ';display:flex;align-items:center;gap:6px">' + ic('arrow-back-up', 16) + g.other + ' · ' + on + ' ' + plural(on, g.forms) + '</span><span class="sum-mid">' + (g.doc ? '+' : '−') + usd(oth) + '</span></div>';
    return h + '</div>';
  }

  function viewList() {
    var g = GR[S.grp], q = S.q.trim().toLowerCase(), full = S.user.role !== 'view', h = '';
    var items = (S.data.groups[S.grp] || []).slice().sort(function (a, b) { return (b.last || '').localeCompare(a.last || '') || a.name.localeCompare(b.name, 'ru'); });
    items.forEach(function (c) {
      if (q && c.name.toLowerCase().indexOf(q) < 0) return;
      var o = c.balance < 0, isOpen = full && S.open === c.id;
      var letter = c.name.replace(/^(ИП|ООО|ОАО|ЗАО|Фабрика|Карго|Цех)\s+/i, '').replace(/[«"]/g, '').charAt(0).toUpperCase();
      var inner = '<span class="avatar">' + esc(letter) + '</span><span class="grow" style="min-width:0"><span class="name">' + esc(c.name) + '</span><span class="small">' + (c.last ? 'Последняя операция ' + dShort(c.last) : 'Операций нет') + '</span></span>' +
        '<span class="amt"><span class="small" style="font-size:11px">' + (c.balance === 0 ? 'долга нет' : o ? g.neg : g.pos) + '</span><b style="color:' + (c.balance === 0 ? 'var(--sub)' : o ? 'var(--green)' : 'var(--red)') + '">' + usd(c.balance) + '</b></span>';
      h += '<div class="card">' + (full
        ? '<button class="card-head" data-act="card" data-id="' + esc(c.id) + '" aria-expanded="' + isOpen + '">' + inner + '<span style="color:var(--muted)">' + ic(isOpen ? 'chevron-up' : 'chevron-down', 18) + '</span></button>'
        : '<div class="card-head">' + inner + '</div>') +
        (isOpen ? '<div class="feed">' + viewFeed(g, c) + '</div>' : '') + '</div>';
    });
    return h || '<div class="small" style="padding:8px 2px">Никого не нашлось</div>';
  }

  /* ---------- история контрагента ---------- */
  function balBox(g, label, v, dashed) {
    var bg, fg;
    if (v < 0 && !g.doc) { bg = '#D3EADC'; fg = '#0F6E56'; }
    else if (v < 0) { bg = '#EAF3DE'; fg = '#27500A'; }
    else { bg = '#FAEEDA'; fg = '#633806'; }
    return '<div class="bal' + (dashed ? ' dashed' : '') + '" style="background:' + bg + ';color:' + fg + '"><span class="k">' + ic('calendar', 16) + label + '</span><span class="r"><small>' + (v < 0 ? g.neg : g.pos) + '</small><b>' + usd(v) + '</b></span></div>';
  }

  var PER = [['cur', 'Этот месяц'], ['prev', 'Прошлый месяц'], ['q3', '3 месяца'], ['custom', 'Период…']];
  function periodRange() {
    var t = new Date(), y = t.getFullYear(), m = t.getMonth();
    if (S.period === 'cur') return [isoOf(new Date(y, m, 1)), isoOf(new Date(y, m + 1, 0))];
    if (S.period === 'prev') return [isoOf(new Date(y, m - 1, 1)), isoOf(new Date(y, m, 0))];
    if (S.period === 'q3') return [isoOf(new Date(y, m - 2, 1)), isoOf(new Date(y, m + 1, 0))];
    if (S.period === 'custom') return [S.rFrom, S.rTo];
    return null;
  }

  function toolbar() {
    var on = S.calOpen || (S.period && S.period !== 'custom-edit');
    var h = '<div class="toolbar"><span class="h3">' + (S.period && S.period !== 'custom-edit' ? 'За период' : 'Последние операции') + '</span>' +
      '<button class="iconbtn' + (on ? ' on' : '') + '" data-act="cal" aria-label="Выбрать период" aria-expanded="' + S.calOpen + '">' + ic('calendar', 20) + '</button></div>';
    if (!S.calOpen) return h;
    h += '<div class="pills">' + PER.map(function (p) {
      var a = S.period === p[0] || (p[0] === 'custom' && S.period === 'custom-edit');
      return '<button class="pill' + (a ? ' on' : '') + '" data-act="per" data-p="' + p[0] + '">' + p[1] + '</button>';
    }).join('') + (S.period ? '<button class="pill reset" data-act="per" data-p="none">Сбросить</button>' : '') + '</div>';
    if (S.period === 'custom' || S.period === 'custom-edit') {
      h += '<div class="grid2" style="padding:4px 0"><label class="label">С<input id="rf" class="field" type="date" value="' + esc(S.rFrom) + '" style="height:40px;margin-top:2px"></label><label class="label">По<input id="rt" class="field" type="date" value="' + esc(S.rTo) + '" style="height:40px;margin-top:2px"></label></div>' +
        '<div class="err" id="rerr" style="padding-top:0;min-height:0">' + esc(S.rErr) + '</div>' +
        '<button class="btn btn-pri" data-act="apply" style="width:100%;height:40px;margin:4px 0">Показать за период</button>';
    }
    return h;
  }

  function viewFeed(g, c) {
    var ops = prep(c), h = toolbar(), sep = false, pend = null;
    if (!ops.length) return h + '<div class="small" style="padding:12px 0">Операций пока нет</div>';
    var rg = periodRange();
    if (rg && rg[0] && rg[1]) {
      var sel = ops.filter(function (o) { return o.date >= rg[0] && o.date <= rg[1]; });
      if (!sel.length) return h + '<div class="small" style="padding:12px 0">Нет операций за этот период</div>';
      h += balBox(g, 'На конец периода', sel[sel.length - 1].after, true);
      newestFirst(sel, false).forEach(function (e) {
        if (e.t === 'm') { h += '<div class="month">' + monthName(e.k) + '</div>'; sep = false; return; }
        h += opRow(g, c, e.o, sep, false); sep = true;
      });
      return h + balBox(g, 'На начало периода', sel[0].before, true);
    }
    var list = newestFirst(ops, true), shown = 0, oldest = null;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (shown >= S.lim) break;
      if (e.t === 'm') { pend = e; continue; }
      if (e.t === 'b') { h += balBox(g, 'Остаток на 1 ' + monthGen(e.k), e.v, false); sep = false; continue; }
      if (pend) { h += '<div class="month">' + monthName(pend.k) + '</div>'; pend = null; sep = false; }
      h += opRow(g, c, e.o, sep, shown === 0); sep = true; shown++; oldest = e.o;
    }
    var hidden = ops.length - shown;
    if (hidden > 0) {
      h += balBox(g, 'Ранее, до ' + dShort(oldest.date), oldest.before, true) +
        '<div class="grid2" style="padding:8px 0 4px"><button class="btn" data-act="more">' + ic('chevron-down', 18) + 'Ещё ' + Math.min(STEP, hidden) + '</button>' +
        '<button class="btn btn-ghost" data-act="all">Вся история (' + ops.length + ')</button></div>';
    }
    return h;
  }

  function opLabel(g, o) {
    var cur = o.cur === 'USD' ? ' в долларах' : o.cur === 'RUB' ? ' в рублях' : ' в ' + o.cur;
    switch (o.t) {
      case 'demand': return 'Отгрузка';
      case 'supply': return g.inL;
      case 'salesreturn': return 'Возврат от клиента';
      case 'purchasereturn': return 'Наш возврат';
      case 'counterpartyadjustment': return 'Корректировка долга';
      case 'paymentin': case 'cashin': return (g.doc ? 'Получили деньги' : 'Оплата') + cur;
      case 'paymentout': case 'cashout': return (g.doc ? 'Мы оплатили' : 'Мы вернули деньги') + cur;
    }
    return o.k === 'pay' ? 'Оплата' + cur : g.inL;
  }

  function opRow(g, c, o, sep, first) {
    var key = c.id + '|' + o.i, hasItems = !!(o.items && o.items.length), ex = hasItems && S.openOp === key;
    var good = o.delta > 0 ? !g.doc : g.doc;
    var fg = good ? 'var(--green)' : 'var(--red)', bg = good ? 'var(--green-bg)' : 'var(--red-bg)';
    var icon = o.k === 'in' ? g.inI : o.k === 'ret' ? 'arrow-back-up' : o.k === 'adj' ? 'refresh' : (o.cur === 'RUB' ? 'currency-rubel' : 'currency-dollar');
    var lbl = o.after < 0 ? g.neg : g.pos, aftC = o.after < 0 ? 'var(--green)' : 'var(--text)';
    var bl = '<span style="color:var(--muted)">' + lbl + ' ' + nf(Math.round(Math.abs(o.before))) + '</span> <span style="color:var(--muted)">' + ic('arrow-right', 12) + '</span> <b style="color:' + aftC + ';font-weight:600">' + usd(o.after) + '</b>';
    var badge = '', sub;
    if (hasItems) {
      var q = qty(o), u = unitOf(o, g);
      if (g.doc) {
        badge = '<div style="margin:4px 0;display:flex;gap:6px;flex-wrap:wrap"><span class="badge mono" style="background:#E6F1FB;color:#0C447C">№' + esc(o.num) + '</span>' +
          (o.places ? '<span class="badge" style="background:#fff;color:var(--sub);display:inline-flex;align-items:center;gap:3px">' + ic('box', 13) + esc(o.places) + ' мест</span>' : '') + '</div>';
        sub = nf(q) + ' ' + u;
      } else sub = '№' + esc(o.num) + ', ' + nf(q) + ' ' + u;
    } else sub = esc(o.note || ('№' + o.num));
    var chips = '';
    if (o.cur !== 'USD' && o.cur !== '?' && o.k === 'pay') {
      chips = '<div class="chips"><span class="chip">' + nf(Math.round(o.amount)) + ' ' + curSign(o.cur) + '</span><span style="color:var(--muted)">' + ic('arrow-right', 14) + '</span>' +
        '<span class="chip" style="background:' + bg + ';color:' + fg + '">' + usd(o.delta) + '</span>' +
        (o.rate ? '<span style="color:var(--sub)">по курсу ' + Number(o.rate).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</span>' : '') + '</div>';
    }
    var body = '<span class="opic" style="background:' + bg + ';color:' + fg + '">' + ic(icon, 16) + '</span><span class="op-body">' +
      '<span class="line"><span class="t">' + opLabel(g, o) + (hasItems ? ' <span style="color:var(--muted)">' + ic(ex ? 'chevron-up' : 'chevron-down', 14) + '</span>' : '') + (first ? '<span class="tag-last">последняя</span>' : '') + '</span>' +
      '<span class="v" style="color:' + fg + '">' + (o.delta > 0 ? '+' : '−') + usd(o.delta) + '</span></span>' + badge + chips +
      '<span class="line wrap2"><span>' + dShort(o.date) + ' · ' + sub + '</span><span style="white-space:nowrap">' + bl + '</span></span></span>';
    var h = '<div class="op' + (sep ? ' sep' : '') + '">';
    if (hasItems) {
      h += '<div class="op-row"><button class="op-main" data-act="op" data-k="' + esc(key) + '" aria-expanded="' + ex + '">' + body + '</button>' +
        '<button class="xbtn" data-act="xls" data-k="' + esc(key) + '" aria-label="Скачать накладную в Excel" title="Скачать накладную">' + ic(S.dl === key ? 'check' : 'file-spreadsheet', 20) + '</button></div>';
      if (ex) h += goods(g, o);
    } else h += '<div class="op-main">' + body + '</div>';
    return h + '</div>';
  }

  function goods(g, o) {
    var tq = 0, ts = 0, rows = '';
    o.items.forEach(function (x) {
      var s = x.q * x.p; ts += s; if (x.u === 'шт') tq += x.q;
      rows += '<div class="row"><div style="min-width:0"><div style="font-size:13px;font-weight:600">' + esc(x.n) + '</div><div class="small">' + nf(x.q) + ' ' + esc(x.u) + ' × ' + usd2(x.p) + '</div></div><div style="font-size:13px;font-weight:600;white-space:nowrap">' + usd(s) + '</div></div>';
    });
    var head = g.doc ? '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0 2px"><span style="color:var(--sub)">Документ</span><span class="mono">№' + esc(o.num) + ' от ' + dShort(o.date) + '</span></div>' : '';
    return '<div class="goods">' + head + '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--sub);padding:6px 0"><span>Товар</span><span>Сумма</span></div>' + rows +
      '<div class="tot"><span>Итого' + (tq ? ' · ' + nf(tq) + ' шт' : '') + (o.places ? ' · ' + esc(o.places) + ' мест' : '') + '</span><span>' + usd(ts) + '</span></div></div>';
  }


  /* ---------- пользователи и коды (только владелец) ---------- */
  var ROLE_SEL = [['view', 'Только просмотр (глаз)'], ['full', 'Полный доступ (лупа)']];
  function when(iso) {
    if (!iso) return '';
    var d = new Date(iso), now = new Date(), min = (now - d) / 60000;
    if (min < 15) return 'сейчас';
    var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return 'сегодня, ' + hm;
    if (d.toDateString() === y.toDateString()) return 'вчера, ' + hm;
    return d.getDate() + ' ' + MS_[d.getMonth()] + (d.getFullYear() !== THIS_YEAR ? ' ' + d.getFullYear() : '') + ', ' + hm;
  }
  function devWord(n) { return plural(n, ['устройство', 'устройства', 'устройств']); }

  function viewUsers() {
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><div style="font-size:18px;font-weight:600">Пользователи и коды</div><div class="small">Видите и меняете только вы</div></div>' +
      '<button class="iconbtn" data-act="uclose" aria-label="Закрыть" style="color:var(--sub)">' + ic('x', 20) + '</button></div>';
    if (S.uLoading && !S.uList) return h + '<div class="foot" style="padding:30px 0">Загружаю…</div>';
    if (!S.uList) return h + '<div class="note" style="background:var(--red-bg);color:var(--red)">' + esc(S.uMsg || 'Не удалось загрузить') + '</div>';
    if (S.uRo) h += '<div class="note" style="background:#FAEEDA;color:#633806;margin-bottom:10px">Хранилище не подключено, поэтому здесь только просмотр. Коды меняются в настройках функции в Яндекс Облаке (шаг 4 в инструкции).</div>';
    var dis = S.uRo ? ' disabled' : '';
    h += '<div class="list">';
    S.uList.forEach(function (u, i) {
      var R = ROLE[u.role] || ROLE.view, own = u.role === 'owner', devs = u.devices || [];
      var online = devs.some(function (d) { return when(d.last) === 'сейчас'; });
      h += '<div class="card" style="padding:12px 14px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="position:relative;width:40px;height:40px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;background:' + R[2] + ';color:' + R[3] + '">' + ic(R[1], 20) +
        (online ? '<span title="В сети" style="position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:6px;background:#1D9E75;border:2px solid var(--card)"></span>' : '') + '</span>' +
        '<span class="grow" style="min-width:0"><span class="name">' + (u.name ? esc(u.name) : 'Новый пользователь') + (own ? ' <span style="font-size:12px;font-weight:400;color:var(--sub)">· это вы</span>' : '') + '</span>' +
        '<span class="small" style="color:' + (online ? 'var(--green)' : 'var(--sub)') + '">' + (online ? 'в сети · ' : '') + devs.length + ' ' + devWord(devs.length) + '</span></span>' +
        (own || S.uRo ? '' : '<button class="iconbtn" data-act="udel" data-i="' + i + '" aria-label="Удалить пользователя" style="width:40px;height:40px;color:var(--red);border-color:#EBB9B9">' + ic('trash', 18) + '</button>') + '</div>' +
        '<div class="grid2"><label class="label">Имя<input class="field" data-uf="name" data-i="' + i + '" type="text" value="' + esc(u.name) + '" style="height:40px;margin-top:2px"' + dis + '></label>' +
        '<label class="label">Код<span style="display:flex;gap:4px;margin-top:2px"><input class="field mono" data-uf="code" data-i="' + i + '" type="' + (u._show ? 'text' : 'password') + '" inputmode="numeric" autocomplete="off" maxlength="12" value="' + esc(u.code) + '" style="height:40px;min-width:0"' + dis + '>' +
        '<button class="iconbtn" data-act="ushow" data-i="' + i + '" aria-label="' + (u._show ? 'Скрыть код' : 'Показать код') + '" style="width:40px;height:40px">' + ic(u._show ? 'eye-off' : 'eye', 18) + '</button></span></label></div>';
      if (!own) h += '<label class="label" style="margin-top:8px">Доступ<select class="field" data-uf="role" data-i="' + i + '" style="height:40px;margin-top:2px"' + dis + '>' +
        ROLE_SEL.map(function (r) { return '<option value="' + r[0] + '"' + (u.role === r[0] ? ' selected' : '') + '>' + r[1] + '</option>'; }).join('') + '</select></label>';
      if (u._orig !== undefined && u.code !== u._orig && devs.length) h += '<div class="note" style="margin-top:8px;background:#FAEEDA;color:#633806;font-size:12px">После сохранения ' + (own ? 'другие ваши устройства выйдут' : esc(u.name || 'человек') + ' выйдет на всех устройствах') + ' и войдёт уже с новым кодом.</div>';
      h += '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--sep)"><div class="h3" style="margin-bottom:4px">Устройства</div>';
      if (!devs.length) h += '<div class="small" style="padding:6px 0">' + (u.id ? 'Нигде не вошёл' : 'Появятся после первого входа') + '</div>';
      devs.forEach(function (d, j) {
        var now = when(d.last) === 'сейчас';
        h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;' + (j ? 'border-top:1px solid var(--sep);' : '') + '"><span style="width:32px;height:32px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;background:#fff;color:var(--green)">' + ic(d.type === 'mobile' ? 'device-mobile' : 'device-desktop', 18) + '</span>' +
          '<span class="grow" style="min-width:0"><span style="display:block;font-size:14px;font-weight:600">' + esc(d.name) + (d.me ? ' <span class="tag-last" style="margin-left:2px">это устройство</span>' : '') + '</span>' +
          '<span class="small">Вошёл ' + when(d.created) + '</span><span class="small" style="color:' + (now ? 'var(--green)' : 'var(--sub)') + '">Был в сервисе: ' + when(d.last) + '</span></span>' +
          (d.me || S.uRo ? '' : '<button class="btn" data-act="ukick" data-u="' + esc(u.id) + '" data-d="' + esc(d.id) + '" style="height:36px;padding:0 10px;font-size:12px;color:var(--red);border-color:#EBB9B9">' + ic('logout', 16) + 'Выйти</button>') + '</div>';
      });
      var others = devs.filter(function (d) { return !d.me; }).length;
      if (others > 1 && !S.uRo) h += '<button class="btn" data-act="ukickall" data-u="' + esc(u.id) + '" style="width:100%;height:40px;margin-top:6px;background:transparent;color:var(--red);border:1px dashed #EBB9B9;font-size:13px">Выйти на всех устройствах' + (own ? ', кроме этого' : '') + '</button>';
      h += '</div></div>';
    });
    h += '</div>';
    if (!S.uRo) h += '<button class="btn" data-act="uadd" style="width:100%;margin-top:10px;border-style:dashed;border-color:#1D9E75">' + ic('user-plus', 18) + 'Добавить пользователя</button>';
    h += '<div id="uMsg" style="font-size:13px;min-height:20px;padding:10px 2px 0;color:' + (S.uMsgOk ? 'var(--green)' : 'var(--red)') + '">' + esc(S.uMsg) + '</div>';
    if (!S.uRo) h += '<div class="grid2" style="margin-top:4px"><button class="btn btn-ghost" data-act="ucancel">Отмена</button><button class="btn btn-pri" data-act="usave">' + (S.uLoading ? 'Сохраняю…' : 'Сохранить') + '</button></div>';
    return h;
  }
  function setUsers(j) {
    S.uRo = !!j.ro;
    S.uList = (j.users || []).map(function (u) { var x = {}; for (var k in u) x[k] = u[k]; x._orig = u.code; x._show = false; return x; });
  }
  function usersCall(body, okMsg) {
    S.uLoading = true; S.uMsg = ''; render();
    body.session = S.session;
    api(body).then(function (j) {
      S.uLoading = false; setUsers(j);
      if (j.session) { S.session = j.session; store({ session: S.session, user: S.user }); }
      S.uMsg = okMsg || ''; S.uMsgOk = true; render();
    }).catch(function (e) {
      S.uLoading = false;
      if (e.status === 401) { logout(); S.loginErr = 'Нужно войти заново'; render(); return; }
      S.uMsg = e.message || 'Ошибка'; S.uMsgOk = false; render();
    });
  }
  function validateUsers() {
    var seen = {}, err = '';
    S.uList.forEach(function (u) {
      if (err) return;
      var c = String(u.code || '').trim();
      if (!String(u.name || '').trim()) err = 'Введите имя у каждого пользователя';
      else if (!/^\d{4,12}$/.test(c)) err = (u.name || 'Код') + ': код должен быть из 4–12 цифр';
      else if (seen[c]) err = 'Код ' + (u.name || '') + ' совпадает с кодом «' + seen[c] + '»';
      seen[c] = u.name;
    });
    return err;
  }

  /* ---------- общий рендер и события ---------- */
  var app = document.getElementById('app');
  function render() {
    app.innerHTML = S.session ? viewMain() : viewLogin();
    if (!S.session) { var p = document.getElementById('pin'); if (p && !('ontouchstart' in window)) p.focus(); }
  }
  function renderList() {
    var l = document.getElementById('list'); if (l) l.innerHTML = viewList();
    var s = document.getElementById('sum'); if (s) s.innerHTML = viewSum();
  }
  function findOp(key) {
    var p = key.split('|'), c = (S.data.groups[S.grp] || []).filter(function (x) { return x.id === p[0]; })[0];
    return c ? { c: c, o: prep(c)[+p[1]] } : null;
  }

  app.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'login') { var v = (document.getElementById('pin').value || '').trim(); if (!v) { S.loginErr = 'Введите код'; render(); return; } login(v); return; }
    if (a === 'logout') { S.screen = 'main'; logout(); return; }
    if (a === 'users') { if (S.screen === 'users') { S.screen = 'main'; render(); return; } S.screen = 'users'; S.uList = null; usersCall({ action: 'users' }); return; }
    if (a === 'uclose' || a === 'ucancel') { S.screen = 'main'; S.uMsg = ''; render(); return; }
    if (a === 'ushow') { var u1 = S.uList[+b.getAttribute('data-i')]; u1._show = !u1._show; render(); return; }
    if (a === 'udel') { var di = +b.getAttribute('data-i'), du = S.uList[di]; S.uList.splice(di, 1); S.uMsg = (du.name || 'Пользователь') + ' будет удалён после «Сохранить»'; S.uMsgOk = false; render(); return; }
    if (a === 'uadd') { S.uList.push({ name: '', code: '', role: 'view', devices: [], _show: true }); S.uMsg = ''; render(); var ins = app.querySelectorAll('input[data-uf="name"]'); if (ins.length) ins[ins.length - 1].focus(); return; }
    if (a === 'usave') { var ve = validateUsers(); if (ve) { S.uMsg = ve; S.uMsgOk = false; render(); return; }
      usersCall({ action: 'saveUsers', users: S.uList.map(function (u) { return { id: u.id, name: String(u.name).trim(), code: String(u.code).trim(), role: u.role }; }) }, 'Сохранено. Новые коды работают со следующего входа.'); return; }
    if (a === 'ukick') { usersCall({ action: 'kick', userId: b.getAttribute('data-u'), deviceId: b.getAttribute('data-d') }, 'Готово: на этом устройстве выполнен выход'); return; }
    if (a === 'ukickall') { usersCall({ action: 'kick', userId: b.getAttribute('data-u'), all: true }, 'Готово: выход на всех устройствах'); return; }
    if (a === 'reload') { loadData(); return; }
    if (a === 'card') { var id = b.getAttribute('data-id'); S.open = S.open === id ? null : id; resetCard(); renderList(); return; }
    if (a === 'op') { var k = b.getAttribute('data-k'); S.openOp = S.openOp === k ? null : k; renderList(); return; }
    if (a === 'xls') { var k2 = b.getAttribute('data-k'), f = findOp(k2); if (f) downloadExcel(GR[S.grp], f.c, f.o).then(function (ok) { if (ok) { S.dl = k2; renderList(); } }); return; }
    if (a === 'more') { S.lim += STEP; renderList(); return; }
    if (a === 'all') { S.lim = 1e9; renderList(); return; }
    if (a === 'cal') { S.calOpen = !S.calOpen; renderList(); return; }
    if (a === 'per') { var p = b.getAttribute('data-p'); S.rErr = ''; if (p === 'none') { S.period = null; S.lim = STEP; } else if (p === 'custom') S.period = 'custom-edit'; else S.period = p; renderList(); return; }
    if (a === 'apply') {
      S.rFrom = document.getElementById('rf').value; S.rTo = document.getElementById('rt').value;
      if (!S.rFrom || !S.rTo) { S.rErr = 'Выберите обе даты'; S.period = 'custom-edit'; }
      else if (S.rFrom > S.rTo) { S.rErr = 'Дата «с» позже даты «по»'; S.period = 'custom-edit'; }
      else { S.rErr = ''; S.period = 'custom'; }
      renderList(); return;
    }
  });
  app.addEventListener('keydown', function (ev) {
    if (ev.target.id === 'pin' && ev.key === 'Enter') { ev.preventDefault(); app.querySelector('[data-act="login"]').click(); }
  });
  app.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.hasAttribute && t.hasAttribute('data-uf')) {
      var ui = S.uList[+t.getAttribute('data-i')], uf = t.getAttribute('data-uf'); ui[uf] = t.value;
      if (S.uMsg) { S.uMsg = ''; var um = document.getElementById('uMsg'); if (um) um.textContent = ''; }
      return;
    }
    if (t.id === 'q') { S.q = t.value; var l = document.getElementById('list'); if (l) l.innerHTML = viewList(); return; }
    if (t.id === 'pin' && S.loginErr) { S.loginErr = ''; t.style.borderColor = ''; var e = document.getElementById('pinErr'); if (e) e.textContent = ''; }
    if ((t.id === 'rf' || t.id === 'rt') && S.rErr) { S.rErr = ''; var r = document.getElementById('rerr'); if (r) r.textContent = ''; }
  });
  app.addEventListener('change', function (ev) {
    var tf = ev.target.getAttribute && ev.target.getAttribute('data-uf');
    if (tf === 'role') { S.uList[+ev.target.getAttribute('data-i')][tf] = ev.target.value; render(); return; }
    if (ev.target.id === 'grp') { S.grp = ev.target.value; S.q = ''; S.open = null; resetCard(); render(); }
  });

  /* ---------- демо-режим ---------- */
  var DEMO_STORE = { users: [
    { id: 'owner', name: 'Владелец', code: '1111', role: 'owner', devices: [] },
    { id: 'altynbek', name: 'Алтынбек', code: '2222', role: 'full', devices: [{ id: 'a1', name: 'Samsung Galaxy A54', type: 'mobile', created: new Date(Date.now() - 12 * 864e5).toISOString(), last: new Date(Date.now() - 40 * 60e3).toISOString() }] },
    { id: 'nurbek', name: 'Нурбек', code: '3333', role: 'view', devices: [
      { id: 'n1', name: 'Redmi Note 12', type: 'mobile', created: new Date(Date.now() - 2 * 864e5).toISOString(), last: new Date(Date.now() - 5 * 60e3).toISOString() },
      { id: 'n2', name: 'iPhone', type: 'mobile', created: new Date(Date.now() - 6 * 864e5).toISOString(), last: new Date(Date.now() - 3 * 864e5).toISOString() }] }
  ] };
  try { var ds0 = JSON.parse(localStorage.getItem('dolgi-demo-users') || 'null'); if (ds0 && ds0.users) DEMO_STORE = ds0; } catch (e) {}
  function demoSave() { try { localStorage.setItem('dolgi-demo-users', JSON.stringify(DEMO_STORE)); } catch (e) {} }
  function demoDevice() {
    var ua = navigator.userAgent || '';
    if (/iPhone/.test(ua)) return { name: 'iPhone', type: 'mobile' };
    if (/Android/.test(ua)) return { name: 'Android', type: 'mobile' };
    var os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : 'компьютер';
    var br = /YaBrowser/.test(ua) ? 'Яндекс Браузер' : /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Браузер';
    return { name: br + ' · ' + os, type: 'desktop' };
  }
  function demoSession(token) {
    var p = String(token || '').split('.'); if (p[0] !== 'demo') return null;
    var u = DEMO_STORE.users.filter(function (x) { return x.id === p[1]; })[0];
    if (!u || u.code !== p[3] || !u.devices.some(function (d) { return d.id === p[2]; })) return null;
    return { user: u, sid: p[2] };
  }
  function demoUsers(sid) { return { ro: false, users: DEMO_STORE.users.map(function (u) { return { id: u.id, name: u.name, code: u.code, role: u.role, devices: u.devices.map(function (d) { var x = {}; for (var k in d) x[k] = d[k]; x.me = d.id === sid; return x; }) }; }) }; }
  function demoApi(body) {
    return new Promise(function (ok, fail) {
      setTimeout(function () {
        function no(msg, st) { var e = new Error(msg); e.status = st; fail(e); }
        if (body.action === 'login') {
          var u = DEMO_STORE.users.filter(function (x) { return x.code === String(body.code); })[0];
          if (!u) return no('Неверный код', 401);
          var sid = Math.random().toString(36).slice(2, 10), now = new Date().toISOString(), dv = demoDevice();
          u.devices.push({ id: sid, name: dv.name, type: dv.type, created: now, last: now }); demoSave();
          return ok({ session: ['demo', u.id, sid, u.code].join('.'), user: { name: u.name, role: u.role } });
        }
        var s = demoSession(body.session);
        if (!s) return no('Нужно войти заново', 401);
        s.user.devices.forEach(function (d) { if (d.id === s.sid) d.last = new Date().toISOString(); }); demoSave();
        if (body.action === 'data') {
          var d = demoData();
          if (s.user.role === 'view') Object.keys(d.groups).forEach(function (k) { d.groups[k] = d.groups[k].map(function (c) { return { id: c.id, name: c.name, balance: c.balance, last: c.last }; }); });
          d.user = { name: s.user.name, role: s.user.role }; return ok(d);
        }
        if (s.user.role !== 'owner') return no('Только для владельца', 403);
        if (body.action === 'kick') {
          DEMO_STORE.users.forEach(function (u) { if (u.id === body.userId) u.devices = u.devices.filter(function (d) { return body.all ? d.id === s.sid : (d.id !== body.deviceId || d.id === s.sid); }); });
          demoSave(); return ok(demoUsers(s.sid));
        }
        if (body.action === 'saveUsers') {
          var newSession = null;
          DEMO_STORE.users = body.users.map(function (u) {
            var old = DEMO_STORE.users.filter(function (x) { return x.id === u.id; })[0], own = old && old.role === 'owner';
            var devs = old ? old.devices : [];
            if (old && old.code !== u.code) devs = own ? devs.filter(function (d) { return d.id === s.sid; }) : [];
            var nu = { id: old ? old.id : 'u' + Math.random().toString(36).slice(2, 8), name: u.name, code: u.code, role: own ? 'owner' : u.role, devices: devs };
            if (own && old.code !== u.code) newSession = ['demo', nu.id, s.sid, nu.code].join('.');
            return nu;
          });
          demoSave(); var r = demoUsers(s.sid); if (newSession) r.session = newSession; return ok(r);
        }
        return ok(demoUsers(s.sid));
      }, 200);
    });
  }
  function demoData() {
    if (LOCAL) return JSON.parse(JSON.stringify(LOCAL));
    var now = new Date();
    function dm(off, day) { var d = new Date(now.getFullYear(), now.getMonth() + off, 1); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last, off === 0 ? now.getDate() : 31)); return isoOf(d); }
    function inv(t, off, day, num, delta, items, places) { var o = { k: 'in', t: t, date: dm(off, day), num: num, cur: 'USD', amount: Math.abs(delta), delta: delta, items: items }; if (places) o.places = places; return o; }
    function pay(t, off, day, num, delta, cur, amount, rate, note) { return { k: 'pay', t: t, date: dm(off, day), num: num, cur: cur, amount: amount, rate: rate || null, delta: delta, note: note }; }
    function it(n, q, p, u) { return { n: n, q: q, p: p, u: u || 'шт' }; }
    function cp(id, name, ops) { var b = 0; ops.forEach(function (o) { b += o.delta; }); return { id: id, name: name, balance: r2(b), last: ops.length ? ops[ops.length - 1].date : null, ops: ops }; }
    return {
      updated: now.toISOString(),
      groups: {
        clients: [
          cp('c1', 'ИП Сафарова', [inv('demand', -1, 5, '00102', 3000, [it('Футболка базовая', 200, 6), it('Лонгслив', 200, 9)]), pay('paymentin', -1, 18, '41', -2000, 'RUB', 180000, 90, 'Перевод на р/с'), inv('demand', 0, 3, '00118', 5200, [it('Худи оверсайз', 250, 10), it('Платье трикотажное', 200, 9), it('Футболка базовая', 150, 6)]), pay('cashin', 0, 10, '12', -1500, 'USD', 1500, null, 'Наличные USD'), inv('demand', 0, 15, '00131', 2600, [it('Худи оверсайз', 100, 10), it('Брюки карго', 200, 8)]), pay('paymentin', 0, 20, '57', -2000, 'RUB', 160000, 80, 'Перевод на р/с'), pay('cashin', 0, 24, '15', -1400, 'RUB', 113400, 81, 'Наличные')]),
          cp('c2', 'ООО «Стиль Маркет»', [inv('demand', 0, 1, '00112', 6000, [it('Платье трикотажное', 400, 9), it('Худи оверсайз', 240, 10)]), inv('demand', 0, 15, '00129', 3800, [it('Футболка базовая', 300, 6), it('Брюки карго', 250, 8)]), pay('paymentin', 0, 22, '60', -5000, 'USD', 5000, null, 'Перевод USD')]),
          cp('c3', 'Ахмедов Р.', [inv('demand', 0, 8, '00124', 2900, [it('Лонгслив', 200, 9), it('Футболка базовая', 100, 6), it('Худи оверсайз', 50, 10)]), pay('paymentin', 0, 18, '58', -600, 'RUB', 48600, 81, 'Перевод на карту')]),
          cp('c4', 'ИП Ким', [pay('cashin', -1, 25, '9', -1000, 'USD', 1000, null, 'Аванс USD'), inv('demand', 0, 22, '00140', 700, [it('Футболка базовая', 50, 6), it('Худи оверсайз', 40, 10)])])
        ],
        factories: [
          cp('f1', 'Фабрика Гуанчжоу', [inv('supply', -1, 10, 'GZ-0055', 18000, [it('Худи оверсайз', 2000, 5), it('Брюки карго', 2000, 4)], 80), pay('paymentout', -1, 28, '33', -8000, 'USD', 8000, null, 'Перевод USD'), pay('paymentout', 0, 21, '39', -4000, 'USD', 4000, null, 'Перевод USD')]),
          cp('f2', 'Фабрика Бишкек', [inv('supply', 0, 2, 'BK-0061', 7500, [it('Платье трикотажное', 1500, 5)], 30), pay('paymentout', 0, 19, '37', -3000, 'RUB', 243000, 81, 'Перевод на р/с')]),
          cp('f3', 'Цех «Ала-Тоо»', [pay('cashout', -1, 20, '8', -2000, 'USD', 2000, null, 'Аванс USD'), inv('supply', 0, 17, 'AT-0009', 1500, [it('Пошив худи', 600, 2), it('Пошив футболок', 300, 1)], 18)])
        ],
        cargo: [
          cp('k1', 'Карго «Шёлковый путь»', [inv('supply', 0, 6, '214', 8000, [it('Доставка', 2800, 2.75, 'кг'), it('Страховка груза', 1, 300, 'услуга')], 112), pay('cashout', 0, 23, '19', -2000, 'RUB', 162000, 81, 'Наличные')]),
          cp('k2', 'Карго Express', [inv('supply', -1, 22, '209', 3600, [it('Доставка', 1200, 3, 'кг')], 48), pay('cashout', 0, 12, '11', -1000, 'USD', 1000, null, 'Наличные USD')]),
          cp('k3', 'Карго «Восток»', [inv('supply', 0, 20, '217', 5100, [it('Доставка', 1700, 3, 'кг')], 68)])
        ]
      }
    };
  }

  /* ---------- старт ---------- */
  var saved = restore();
  if (saved && saved.session) { S.session = saved.session; S.user = saved.user; loadData(); }
  else render();
})();
