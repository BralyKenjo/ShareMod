/* auto-translate.js
 * Tự động chuyển giao diện sang tiếng Anh khi người dùng KHÔNG ở Việt Nam.
 * Chỉ cần 1 trong 3 điều kiện: ngôn ngữ trình duyệt ≠ tiếng Việt · múi giờ ≠ Việt Nam · IP ngoài Việt Nam.
 * Người dùng có thể bấm nút VI / EN (góc phải trên) để tự chọn; lựa chọn này được ưu tiên và lưu lại.
 */
(function () {
  "use strict";

  var EN = {
    "Đang tải...": "Loading...",
    "Script của bạn": "Your script",
    "Chọn link bên dưới hoặc dùng mật khẩu để lấy script": "Choose a link below or use a password to get the script",

    "Tại sao nên chọn Premium?": "Why choose Premium?",
    "Trải nghiệm lấy script nhanh chóng, tiện lợi và không giới hạn:": "Get scripts fast, conveniently and without limits:",
    "Lấy script trực tiếp bằng mật khẩu — không cần vượt link quảng cáo": "Get the script directly with a password — no ad links to bypass",
    "Tiết kiệm thời gian, không bị gián đoạn bởi pop-up": "Save time with no pop-up interruptions",
    "Truy cập kho script chất lượng cao, được cập nhật liên tục": "Access a library of high-quality scripts, constantly updated",
    "Hỗ trợ trực tiếp qua TikTok khi có vấn đề phát sinh": "Direct support via TikTok whenever an issue comes up",
    "💳 Xem bảng giá Premium": "💳 View Premium pricing",

    "Lấy script miễn phí": "Get the script for free",
    "Chọn 1 trong các link dưới để lấy script:": "Pick one of the links below to get the script:",
    "Khuyên dùng · Nhanh & ổn định": "Recommended · Fast & stable",
    "Nhanh nhất · Ít bước hơn": "Fastest · Fewer steps",
    "Dự phòng khi link chính hết": "Backup when the main link is down",
    "Dự phòng · Cuối cùng": "Backup · Last resort",
    "Sau khi vượt link, bạn sẽ được chuyển tới script.": "After completing the link, you'll be taken to the script.",
    "Link": "The",
    "được khuyên dùng — nếu link không hoạt động, thử": "link is recommended — if it doesn't work, try",

    "Nhập mật khẩu": "Enter password",
    "Nhập mật khẩu để lấy script, không cần vượt link": "Enter your password to get the script — no need to bypass links",
    "Nhập mật khẩu để lấy ngay": "Enter your password to get it now",
    "Lưu cho lần sau": "Remember for next time",
    "Xác minh": "Verify",
    "Nếu chưa có mật khẩu hãy liên hệ": "Don't have a password? Contact",
    "hoặc": "or",
    "để mua": "to purchase",

    "Sao chép": "Copy",
    "Đã sao chép ✓": "Copied ✓",
    "Link gốc": "Original link",
    "Bấm vào nút để mở tab:": "Click the button to open it in a new tab:",
    "Mở link gốc": "Open original link",

    "Thiếu ID trên URL.": "Missing ID in the URL.",
    "ID không tồn tại hoặc đã bị xoá.": "This ID doesn't exist or has been deleted.",
    "Lỗi kết nối. Vui lòng thử lại.": "Connection error. Please try again.",
    "Sai mật khẩu": "Incorrect password"
  };

  // Thông báo lỗi từ server (tiếng Việt, không có trong từ điển) sẽ hiện câu này khi ở chế độ English
  var GENERIC_ERR = "Verification failed. Please try again.";
  var VN_TZ = ["Asia/Ho_Chi_Minh", "Asia/Saigon"];

  var lang = "vi";
  var locked = false;               // true khi người dùng đã tự bấm chọn ngôn ngữ
  var orig = new WeakMap();         // text node -> nội dung tiếng Việt gốc
  var phOrig = new WeakMap();       // input -> placeholder gốc
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  /* ---------- Dịch / khôi phục ---------- */
  function tNode(n) {
    if (orig.has(n)) return;
    var p = n.parentNode;
    if (!p || (p.closest && p.closest("pre,script,style,textarea"))) return;
    var m = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m[2]) return;
    var en = has(EN, m[2]) ? EN[m[2]] : undefined;
    if (en === undefined && p.closest && p.closest("#pwMsg")) en = GENERIC_ERR;
    if (en === undefined || en === m[2]) return;
    orig.set(n, n.nodeValue);
    n.nodeValue = m[1] + en + m[3];
  }

  function tPh(el) {
    if (phOrig.has(el)) return;
    var v = el.getAttribute("placeholder");
    if (v && has(EN, v)) {
      phOrig.set(el, v);
      el.setAttribute("placeholder", EN[v]);
    }
  }

  function scan(root) {
    if (root.nodeType === 3) { tNode(root); return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), x;
    while ((x = w.nextNode())) tNode(x);
    if (root.matches && root.matches("[placeholder]")) tPh(root);
    [].forEach.call(root.querySelectorAll("[placeholder]"), tPh);
  }

  function restore() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), x, list = [];
    while ((x = w.nextNode())) if (orig.has(x)) list.push(x);
    list.forEach(function (n) { n.nodeValue = orig.get(n); orig["delete"](n); });
    [].forEach.call(document.querySelectorAll("[placeholder]"), function (el) {
      if (phOrig.has(el)) { el.setAttribute("placeholder", phOrig.get(el)); phOrig["delete"](el); }
    });
  }

  function apply() {
    document.documentElement.lang = lang;
    if (lang === "en") {
      scan(document.body);
      if (document.title === "Đang tải...") document.title = "Loading...";
    } else {
      restore();
      if (document.title === "Loading...") document.title = "Đang tải...";
    }
    [].forEach.call(document.querySelectorAll(".lang-switch button"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === lang);
    });
  }

  function setLang(l, manual) {
    lang = l === "en" ? "en" : "vi";
    if (manual) {
      locked = true;
      try { localStorage.setItem("lang_pref", lang); } catch (e) {}
    }
    apply();
  }

  /* ---------- Nội dung được script gốc chèn thêm về sau (innerHTML, textContent...) ---------- */
  var mo = new MutationObserver(function (list) {
    if (lang !== "en") return;
    list.forEach(function (m) {
      if (m.type === "characterData") tNode(m.target);
      else [].forEach.call(m.addedNodes, scan);
    });
  });

  /* ---------- Phát hiện người dùng ngoài Việt Nam ---------- */
  function localSaysForeign() {
    var l = (navigator.language || "vi").toLowerCase();
    if (l.indexOf("vi") !== 0) return true;                       // ngôn ngữ ≠ tiếng Việt
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (tz) return VN_TZ.indexOf(tz) === -1;                      // múi giờ ≠ Việt Nam
    return new Date().getTimezoneOffset() !== -420;               // dự phòng: UTC+7
  }

  async function getCountry() {
    try {
      var c = sessionStorage.getItem("geo_cc");
      if (c) return c;
    } catch (e) {}
    var sources = [
      ["https://api.country.is/", function (d) { return d.country; }],
      ["https://ipwho.is/", function (d) { return d.country_code; }],
      ["https://get.geojs.io/v1/ip/country.json", function (d) { return (Array.isArray(d) ? d[0] : d).country; }]
    ];
    for (var i = 0; i < sources.length; i++) {
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 3500);
        var r = await fetch(sources[i][0], { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(timer);
        if (!r.ok) continue;
        var cc = sources[i][1](await r.json());
        if (cc) {
          cc = String(cc).toUpperCase();
          try { sessionStorage.setItem("geo_cc", cc); } catch (e) {}
          return cc;
        }
      } catch (e) {}
    }
    return null;
  }

  /* ---------- Nút chuyển VI / EN ---------- */
  function buildSwitch() {
    var css = document.createElement("style");
    css.textContent =
      ".lang-switch{position:fixed;top:12px;right:12px;z-index:10;display:flex;gap:2px;padding:3px;" +
      "background:var(--surface,#121820);border:1px solid var(--border,#1f2a3a);border-radius:999px}" +
      ".lang-switch button{padding:5px 11px;border:0;border-radius:999px;background:transparent;" +
      "color:var(--text-dim,#8b949e);font-family:inherit;font-size:.72rem;font-weight:600;cursor:pointer}" +
      ".lang-switch button.on{background:linear-gradient(135deg,var(--blue,#0077ff),var(--cyan,#00d4ff));color:#fff}";
    document.head.appendChild(css);

    var box = document.createElement("div");
    box.className = "lang-switch";
    ["vi", "en"].forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-lang", l);
      b.textContent = l.toUpperCase();
      b.addEventListener("click", function () { setLang(l, true); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }

  function init() {
    buildSwitch();
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });

    var saved = null;
    try { saved = localStorage.getItem("lang_pref"); } catch (e) {}
    if (saved === "vi" || saved === "en") { setLang(saved, false); locked = true; return; }

    if (localSaysForeign()) { setLang("en", false); return; }

    apply();
    getCountry().then(function (cc) {
      if (!locked && cc && cc !== "VN") setLang("en", false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
