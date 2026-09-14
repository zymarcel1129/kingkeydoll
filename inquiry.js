/* ============================================================
   KingKey Doll — unified order enquiry
   Every purchase button on the site opens this panel. It collects
   the item being viewed, the customer's preferred contact channel
   (Telegram / WhatsApp / Email / Phone) and optional shipping
   details, then produces a ready-to-send email.

   SETUP (two lines):
     KK_EMAIL   — mailbox that receives enquiries
     KK_ENDPOINT — optional. Paste a Formspree/Getform URL to post
                   silently in the background instead of opening
                   the visitor's email client. Leave '' for mailto.
   ============================================================ */
(function () {
  var KK_EMAIL    = 'support@kingkeydoll.com';
  var KK_ENDPOINT = '';
  var KK_TG       = 'https://t.me/+-6MISTjh2iljYWFl';
  var STORE_KEY   = 'kk-inquiry-prefill';

  /* ---------- styles (injected once) ---------- */
  var CSS =
    '#kqi{position:fixed;inset:0;z-index:400;display:none;align-items:flex-start;justify-content:center;' +
    'background:rgba(4,3,5,.86);backdrop-filter:blur(6px);overflow-y:auto;padding:5vh 16px 40px}' +
    '#kqi.on{display:flex}' +
    '#kqi .box{width:100%;max-width:620px;background:#141116;border:1px solid rgba(232,160,191,.28);' +
    'border-radius:18px;padding:30px 30px 26px;box-shadow:0 30px 80px rgba(0,0,0,.6);position:relative}' +
    '#kqi .x{position:absolute;top:14px;right:16px;background:none;border:none;color:#9A8F96;font-size:26px;cursor:pointer;line-height:1}' +
    '#kqi .x:hover{color:#E8A0BF}' +
    '#kqi .eyebrow{color:#E8A0BF;font-size:11px;letter-spacing:.34em;text-transform:uppercase;margin-bottom:8px}' +
    '#kqi h3{font-family:Georgia,serif;font-weight:500;font-size:26px;color:#D4AF37;margin-bottom:6px}' +
    '#kqi .lede{color:#9A8F96;font-size:13.5px;margin-bottom:18px}' +
    '#kqi .item{display:flex;gap:14px;background:#100D10;border:1px solid rgba(232,160,191,.18);' +
    'border-radius:12px;padding:12px;margin-bottom:20px;align-items:center}' +
    '#kqi .item img{width:58px;height:76px;object-fit:cover;border-radius:8px;border:1px solid rgba(232,160,191,.2);flex-shrink:0}' +
    '#kqi .item .nm{color:#E8C766;font-family:Georgia,serif;font-size:18px}' +
    '#kqi .item .rf{color:#9A8F96;font-size:11.5px;letter-spacing:.08em;margin-top:2px}' +
    '#kqi .item .op{color:#E8A0BF;font-size:11.5px;margin-top:5px;line-height:1.5}' +
    '#kqi label{display:block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#E8A0BF;margin:14px 0 6px}' +
    '#kqi .chips{display:flex;gap:8px;flex-wrap:wrap}' +
    '#kqi .chips button{background:transparent;border:1px solid rgba(232,160,191,.28);color:#9A8F96;' +
    'padding:8px 16px;border-radius:999px;font-size:13px;cursor:pointer;transition:.2s}' +
    '#kqi .chips button.on{border-color:#E8A0BF;color:#E8A0BF;background:rgba(232,160,191,.1)}' +
    '#kqi input,#kqi textarea{width:100%;background:#100D10;border:1px solid rgba(232,160,191,.22);' +
    'border-radius:10px;padding:11px 13px;color:#EDE6EA;font-size:14px;font-family:inherit;outline:none}' +
    '#kqi input:focus,#kqi textarea:focus{border-color:#E8A0BF}' +
    '#kqi textarea{min-height:74px;resize:vertical}' +
    '#kqi .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#kqi details{margin-top:14px;border-top:1px dashed rgba(232,160,191,.2);padding-top:12px}' +
    '#kqi summary{cursor:pointer;color:#9A8F96;font-size:12.5px;letter-spacing:.06em}' +
    '#kqi summary:hover{color:#E8A0BF}' +
    '#kqi .send{width:100%;margin-top:22px;padding:14px;background:linear-gradient(135deg,#E8C766,#D4AF37);' +
    'color:#1a1206;border:none;border-radius:999px;font-size:14.5px;font-weight:600;letter-spacing:.06em;cursor:pointer}' +
    '#kqi .send:hover{filter:brightness(1.08)}' +
    '#kqi .fine{color:#9A8F96;font-size:11.5px;text-align:center;margin-top:10px;line-height:1.6}' +
    '#kqi .done{text-align:center}' +
    '#kqi .done .tick{font-size:38px;margin-bottom:6px}' +
    '#kqi .done h4{font-family:Georgia,serif;font-weight:500;color:#D4AF37;font-size:22px;margin-bottom:8px}' +
    '#kqi .done p{color:#9A8F96;font-size:13.5px;line-height:1.7}' +
    '#kqi .fallback{margin-top:16px;background:#100D10;border:1px solid rgba(232,160,191,.2);border-radius:12px;padding:12px}' +
    '#kqi .fallback textarea{font-size:12px;min-height:150px;color:#C9C0C5;line-height:1.55}' +
    '#kqi .acts{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center}' +
    '#kqi .acts a,#kqi .acts button{flex:1;min-width:150px;text-align:center;padding:11px 16px;border-radius:999px;' +
    'font-size:13px;cursor:pointer;text-decoration:none;border:1px solid rgba(232,160,191,.35);background:transparent;color:#E8A0BF}' +
    '#kqi .acts a:hover,#kqi .acts button:hover{background:rgba(232,160,191,.12)}' +
    '#kqi .err{color:#E8A0BF;font-size:12.5px;margin-top:10px;text-align:center;display:none}' +
    '@media(max-width:560px){#kqi .box{padding:24px 18px}#kqi .two{grid-template-columns:1fr}}';

  var METHOD_HINT = {
    Telegram: 'Your Telegram @username',
    WhatsApp: 'WhatsApp number, e.g. +1 415 555 0132',
    Email:    'Your email address',
    Phone:    'Phone number with country code'
  };

  var method = 'Telegram';
  var current = null;

  function el(tag, html) { var d = document.createElement(tag); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- modal skeleton ---------- */
  function build() {
    var style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    var wrap = el('div',
      '<div id="kqi"><div class="box">' +
        '<button class="x" aria-label="Close">&times;</button>' +
        '<div class="eyebrow">Order enquiry</div>' +
        '<h3>Request this piece</h3>' +
        '<p class="lede">We confirm every order personally — tell us how to reach you and we will reply with availability, a payment link and shipping options, usually within 24 hours.</p>' +
        '<div id="kqiItem" class="item"></div>' +
        '<div id="kqiForm">' +
          '<label>How should we contact you?</label>' +
          '<div class="chips" id="kqiChips"></div>' +
          '<label id="kqiHandleLab">Your Telegram</label>' +
          '<input id="kqiHandle" placeholder="' + METHOD_HINT.Telegram + '">' +
          '<label>Email for the order confirmation (optional)</label>' +
          '<input id="kqiEmail" type="email" placeholder="you@example.com">' +
          '<details>' +
            '<summary>Add shipping details now (optional — speeds up your quote)</summary>' +
            '<div class="two" style="margin-top:12px">' +
              '<input id="kqiName" placeholder="Full name">' +
              '<input id="kqiCountry" placeholder="Country / region">' +
            '</div>' +
            '<div style="margin-top:10px"><input id="kqiAddr" placeholder="Street address"></div>' +
            '<div class="two" style="margin-top:10px">' +
              '<input id="kqiCity" placeholder="City / state / ZIP">' +
              '<input id="kqiPhone" placeholder="Phone for the courier">' +
            '</div>' +
          '</details>' +
          '<label>Anything else? (optional)</label>' +
          '<textarea id="kqiNote" placeholder="Height, skin tone, extra head, delivery timing…"></textarea>' +
          '<button class="send" id="kqiSend">Send my enquiry</button>' +
          '<p class="fine">Nothing is charged now and no account is needed. Your details go only to our sales team.</p>' +
          '<div class="err" id="kqiErr"></div>' +
        '</div>' +
        '<div id="kqiDone" style="display:none"></div>' +
      '</div></div>');
    document.body.appendChild(wrap);

    var root = document.getElementById('kqi');
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    root.querySelector('.x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    var chips = document.getElementById('kqiChips');
    ['Telegram', 'WhatsApp', 'Email', 'Phone'].forEach(function (m) {
      var b = document.createElement('button');
      b.textContent = m;
      if (m === method) b.className = 'on';
      b.addEventListener('click', function () {
        method = m;
        Array.prototype.forEach.call(chips.children, function (c) { c.className = (c.textContent === m ? 'on' : ''); });
        document.getElementById('kqiHandleLab').textContent = 'Your ' + m;
        document.getElementById('kqiHandle').placeholder = METHOD_HINT[m];
      });
      chips.appendChild(b);
    });
    document.getElementById('kqiSend').addEventListener('click', submit);
    return root;
  }

  /* ---------- email body ---------- */
  function compose(p, d) {
    var L = [];
    L.push('NEW ORDER ENQUIRY — KingKey Doll');
    L.push('========================================');
    L.push('');
    L.push('ITEM');
    L.push('  Piece      : ' + p.name + (p.sub ? ' — ' + p.sub : ''));
    L.push('  Reference  : ' + (p.ref || '—'));
    if (p.price) L.push('  Price shown: ' + p.price);
    if (p.options && p.options.length) L.push('  Configuration:');
    (p.options || []).forEach(function (o) { L.push('     - ' + o); });
    if (p.src) L.push('  Page       : ' + p.src);
    L.push('');
    L.push('CUSTOMER CONTACT');
    L.push('  Preferred  : ' + d.method);
    L.push('  Handle     : ' + d.handle);
    L.push('  Email      : ' + (d.email || '(not given)'));
    L.push('');
    L.push('SHIPPING (only if the customer filled it in)');
    L.push('  Name       : ' + (d.name || '—'));
    L.push('  Country    : ' + (d.country || '—'));
    L.push('  Address    : ' + (d.addr || '—'));
    L.push('  City/State : ' + (d.city || '—'));
    L.push('  Phone      : ' + (d.phone || '—'));
    L.push('');
    L.push('NOTES');
    L.push('  ' + (d.note || '(none)'));
    L.push('');
    L.push('----------------------------------------');
    L.push('Sent from the KingKey Doll website on ' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    return L.join('\n');
  }

  function subject(p) {
    return 'Order enquiry — ' + (p.ref ? p.ref + ' · ' : '') + p.name;
  }

  /* ---------- open / close ---------- */
  function open(p) {
    current = p || {};
    var root = document.getElementById('kqi') || build();
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) {}

    document.getElementById('kqiItem').innerHTML =
      (current.img ? '<img src="' + esc(current.img) + '" alt="">' : '') +
      '<div><div class="nm">' + esc(current.name || 'KingKey Doll') + '</div>' +
      '<div class="rf">' + esc(current.ref || '') + (current.price ? ' · ' + esc(current.price) : '') + '</div>' +
      ((current.options && current.options.length)
        ? '<div class="op">' + current.options.map(esc).join(' · ') + '</div>' : '') + '</div>';

    document.getElementById('kqiForm').style.display = '';
    document.getElementById('kqiDone').style.display = 'none';
    document.getElementById('kqiErr').style.display = 'none';
    document.getElementById('kqiHandle').value = saved.handle || '';
    document.getElementById('kqiEmail').value = saved.email || '';
    document.getElementById('kqiName').value = saved.name || '';
    document.getElementById('kqiCountry').value = saved.country || '';
    document.getElementById('kqiAddr').value = saved.addr || '';
    document.getElementById('kqiCity').value = saved.city || '';
    document.getElementById('kqiPhone').value = saved.phone || '';

    root.classList.add('on');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('kqiHandle').focus(); }, 60);
  }

  function close() {
    var root = document.getElementById('kqi');
    if (root) root.classList.remove('on');
    document.body.style.overflow = '';
  }

  /* ---------- submit ---------- */
  function submit() {
    var d = {
      method: method,
      handle: document.getElementById('kqiHandle').value.trim(),
      email:  document.getElementById('kqiEmail').value.trim(),
      name:   document.getElementById('kqiName').value.trim(),
      country:document.getElementById('kqiCountry').value.trim(),
      addr:   document.getElementById('kqiAddr').value.trim(),
      city:   document.getElementById('kqiCity').value.trim(),
      phone:  document.getElementById('kqiPhone').value.trim(),
      note:   document.getElementById('kqiNote').value.trim()
    };
    var err = document.getElementById('kqiErr');
    if (!d.handle) {
      err.textContent = 'Please add your ' + d.method + ' contact so we can reply.';
      err.style.display = 'block';
      document.getElementById('kqiHandle').focus();
      return;
    }
    if (d.method === 'Email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.handle)) {
      err.textContent = 'That email address does not look right.';
      err.style.display = 'block'; return;
    }
    err.style.display = 'none';
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}

    var body = compose(current, d);
    var subj = subject(current);

    if (KK_ENDPOINT) {
      fetch(KK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ subject: subj, item: current.name, ref: current.ref, text: body }, d))
      }).then(function () { done(subj, body, true); }).catch(function () { done(subj, body, false); });
      return;
    }
    window.location.href = 'mailto:' + KK_EMAIL +
      '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    done(subj, body, false);
  }

  function done(subj, body, silent) {
    document.getElementById('kqiForm').style.display = 'none';
    var box = document.getElementById('kqiDone');
    box.className = 'done';
    box.style.display = '';
    box.innerHTML =
      '<div class="tick">✉️</div>' +
      '<h4>Thank you — one last step</h4>' +
      '<p>' + (silent
        ? 'Your enquiry has been sent to our sales team. We will reply within 24 hours.'
        : 'Your email app should now be open with everything filled in. Just press <b>send</b> — if nothing opened, copy the text below and mail it to <b>' + KK_EMAIL + '</b>.') +
      '</p>' +
      '<div class="fallback"><textarea readonly id="kqiCopy">' + esc('To: ' + KK_EMAIL + '\nSubject: ' + subj + '\n\n' + body) + '</textarea></div>' +
      '<div class="acts">' +
        '<button id="kqiCopyBtn">Copy the message</button>' +
        '<a href="' + KK_TG + '" target="_blank" rel="noopener">Message us on Telegram</a>' +
      '</div>' +
      '<p class="fine">Prefer to talk now? Telegram is the fastest way to reach us.</p>';
    document.getElementById('kqiCopyBtn').addEventListener('click', function () {
      var t = document.getElementById('kqiCopy');
      t.select(); t.setSelectionRange(0, 99999);
      try { document.execCommand('copy'); } catch (e) {}
      var b = document.getElementById('kqiCopyBtn');
      b.textContent = 'Copied ✓';
      setTimeout(function () { b.textContent = 'Copy the message'; }, 2000);
    });
  }

  window.openInquiry = open;
  window.closeInquiry = close;
})();
