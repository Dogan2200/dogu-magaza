/* DOĞU — örnek giyim mağazası: katalog, renk/beden seçimi, sepet (tarayıcıda saklanır) */
(() => {
  'use strict';
  const P = window.DOGU_PRODUCTS || [], CATS = window.DOGU_CATS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
  const TL = n => nf.format(Math.round(n)) + ' ₺';
  const FREE_SHIP = 1500, SHIP = 79, KEY = 'DOGU_CART_V2';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  /* ---------- Kıyafet çizimleri (düz illüstrasyon, 400×500) ---------- */
  const LINE = 'stroke="rgba(0,0,0,.2)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
  function fabric(id, f, c) {
    const hex = c.hex, alt = c.alt || '#ffffff';
    const P = (w, h, body) => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern>`;
    switch (f) {
      case 'stripe': return P(18, 18, `<rect width="18" height="18" fill="${c.alt ? hex : hex}"/><rect width="6" height="18" fill="${c.alt ? alt : 'rgba(255,255,255,.35)'}"/>`);
      case 'check': return P(36, 36, `<rect width="36" height="36" fill="${hex}"/><rect width="36" height="5" y="15" fill="${c.alt || 'rgba(255,255,255,.16)'}" opacity="${c.alt ? .85 : 1}"/><rect width="5" height="36" x="15" fill="${c.alt || 'rgba(255,255,255,.16)'}" opacity="${c.alt ? .85 : 1}"/><rect width="36" height="1.5" y="30" fill="rgba(0,0,0,.18)"/>`);
      case 'rib': return P(9, 9, `<rect width="9" height="9" fill="${hex}"/><rect width="3" height="9" fill="rgba(0,0,0,.13)"/>`);
      case 'denim': return P(8, 8, `<rect width="8" height="8" fill="${hex}"/><path d="M0 8 L8 0" stroke="rgba(255,255,255,.14)" stroke-width="2"/>`);
      default: return P(400, 500, `<rect width="400" height="500" fill="${hex}"/>`);
    }
  }
  const TOP = (hem, long, flare = 0) => long
    ? `M170 96 Q200 116 230 96 L276 112 L318 158 L340 ${hem - 40} L304 ${hem - 32} L282 210 L${280 + flare} ${hem} L${120 - flare} ${hem} L118 210 L96 ${hem - 32} L60 ${hem - 40} L82 158 L124 112 Z`
    : `M170 96 Q200 116 230 96 L276 112 L324 168 L294 196 L280 184 L280 ${hem} L120 ${hem} L120 184 L106 196 L76 168 L124 112 Z`;
  const DRAW = {
    coat: (fill, p) => `<path d="${TOP(452, true, 18)}" fill="${fill}" ${LINE}/>
      <path d="M170 96 L200 190 L230 96" fill="none" ${LINE}/><path d="M200 190 L200 452" ${LINE}/>
      <path d="M170 96 L150 150 L184 168" fill="none" ${LINE}/><path d="M230 96 L250 150 L216 168" fill="none" ${LINE}/>
      ${p.id === 'civit-trenc' ? `<rect x="118" y="262" width="164" height="16" fill="rgba(0,0,0,.18)"/><rect x="190" y="258" width="20" height="24" fill="none" ${LINE}/>` : ''}
      <g fill="rgba(0,0,0,.3)">${[210, 240, 300, 330].map(y => `<circle cx="184" cy="${y}" r="4"/><circle cx="216" cy="${y}" r="4"/>`).join('')}</g>
      <path d="M134 340 h40 M226 340 h40" ${LINE}/>`,
    jacket: (fill) => `<path d="${TOP(332, true, 4)}" fill="${fill}" ${LINE}/>
      <path d="M170 96 L200 140 L230 96" fill="none" ${LINE}/><path d="M200 140 V332" ${LINE}/>
      <path d="M132 170 h44 v34 h-44 Z M224 170 h44 v34 h-44 Z" fill="none" ${LINE}/>
      <path d="M118 300 h164" ${LINE}/><g fill="#c9a24a">${[160, 210, 260, 310].map(y => `<circle cx="208" cy="${y}" r="4"/>`).join('')}</g>`,
    shirt: (fill) => `<path d="${TOP(392, true)}" fill="${fill}" ${LINE}/>
      <path d="M170 96 L186 128 L200 112 L214 128 L230 96" fill="#fff" ${LINE}/><path d="M200 112 V392" ${LINE}/>
      <g fill="rgba(0,0,0,.28)">${[150, 195, 240, 285, 330].map(y => `<circle cx="207" cy="${y}" r="3.5"/>`).join('')}</g>
      <path d="M140 150 h34 v30 h-34" fill="none" ${LINE}/>`,
    tee: (fill) => `<path d="${TOP(392, false)}" fill="${fill}" ${LINE}/><path d="M172 98 Q200 126 228 98" fill="none" ${LINE}/>`,
    knit: (fill) => `<path d="${TOP(380, true)}" fill="${fill}" ${LINE}/>
      <rect x="166" y="62" width="68" height="46" rx="6" fill="${fill}" ${LINE}/>
      <path d="M120 360 H280 M98 330 L62 322 M302 330 L338 322" ${LINE}/>`,
    hoodie: (fill) => `<path d="M150 112 Q140 50 200 44 Q260 50 250 112 Z" fill="${fill}" ${LINE}/>
      <path d="${TOP(384, true, 6)}" fill="${fill}" ${LINE}/>
      <path d="M170 100 Q200 140 230 100" fill="rgba(0,0,0,.12)" ${LINE}/>
      <path d="M186 120 v40 M214 120 v40" ${LINE}/>
      <path d="M146 290 h108 l14 56 h-136 Z" fill="none" ${LINE}/>`,
    trousers: (fill, p) => `<path d="M126 70 H274 L${p.id === 'genis-paca' ? 312 : 290} 462 H${p.id === 'genis-paca' ? 214 : 214} L200 200 L${p.id === 'genis-paca' ? 186 : 186} 462 H${p.id === 'genis-paca' ? 88 : 110} Z" fill="${fill}" ${LINE}/>
      <path d="M126 92 H274" ${LINE}/><path d="M200 92 V180" ${LINE}/>
      ${p.id === 'kargo' ? `<path d="M118 250 h44 v54 h-44 Z M282 250 h-44 v54 h44 Z" fill="none" ${LINE}/>` : `<path d="M160 92 L168 300 M240 92 L232 300" ${LINE} opacity=".6"/>`}`,
    skirt: (fill) => `<rect x="134" y="96" width="132" height="26" fill="${fill}" ${LINE}/>
      <path d="M134 122 H266 L316 430 H84 Z" fill="${fill}" ${LINE}/>
      <g ${LINE} opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const t = (i + 1) / 10; return `<path d="M${134 + 132 * t} 124 L${84 + 232 * t} 428"/>`; }).join('')}</g>`,
    scarf: (fill) => `<path d="M150 70 H250 L262 400 H162 Z" fill="${fill}" ${LINE}/>
      <path d="M150 70 Q200 130 250 70" fill="rgba(0,0,0,.12)"/>
      <g ${LINE}>${Array.from({ length: 12 }, (_, i) => `<path d="M${166 + i * 8.5} 400 v34"/>`).join('')}</g>`,
    beanie: (fill) => `<path d="M118 330 Q118 150 200 150 Q282 150 282 330 Z" fill="${fill}" ${LINE}/>
      <rect x="110" y="300" width="180" height="66" rx="8" fill="${fill}" ${LINE}/><rect x="110" y="300" width="180" height="66" rx="8" fill="rgba(0,0,0,.08)"/>
      <rect x="182" y="318" width="36" height="28" rx="2" fill="#fff" opacity=".9"/>`,
  };
  function art(p, ci = 0, opts = {}) {
    const c = p.colors[ci] || p.colors[0], id = 'f' + (++uid);
    const label = opts.decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(p.name)}, ${esc(c.name)}"`;
    return `<svg viewBox="0 0 400 500" ${label}><defs>${fabric(id, p.fabric, c)}</defs>
      ${opts.bg === false ? '' : '<rect width="400" height="500" fill="#eceef1"/>'}
      <g>${(DRAW[p.type] || DRAW.tee)(`url(#${id})`, p)}</g></svg>`;
  }

  /* Hero: askılıkta asılı kıyafetler, açılışta bir kez sallanır */
  function rail() {
    const el = $('#rail'); if (!el) return;
    const picks = [['civit-trenc', 1], ['balikci-triko', 0], ['keten-gomlek', 0], ['yun-kaban', 1], ['pileli-etek', 0], ['agir-tisort', 1]];
    const W = 1200, n = picks.length, gap = W / n;
    let s = `<style>@keyframes sway{0%{transform:rotate(0)}25%{transform:rotate(3deg)}55%{transform:rotate(-2deg)}80%{transform:rotate(1deg)}100%{transform:rotate(0)}}</style>
      <rect x="0" y="24" width="${W}" height="3" fill="#16171c"/>`;
    picks.forEach(([id, ci], i) => {
      const p = P.find(x => x.id === id); if (!p) return;
      const cx = gap * i + gap / 2, sc = .6, d = reduce ? '' : `animation:sway 2.4s ${i * 90}ms cubic-bezier(.3,.6,.3,1) both;`;
      s += `<g class="hang" style="transform-origin:${cx}px 26px;${d}">
        <path d="M${cx} 26 v10 q0 8 -8 8" fill="none" stroke="#8a8d96" stroke-width="2" stroke-linecap="round"/>
        <path d="M${cx - 62} 78 L${cx} 44 L${cx + 62} 78" fill="none" stroke="#8a8d96" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        <g transform="translate(${cx - 200 * sc} ${16}) scale(${sc})">${art(p, ci, { bg: false, decorative: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></g>`;
    });
    el.innerHTML = s;
  }

  /* ---------- Sepet ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { cart = []; }
  cart = cart.filter(l => P.some(p => p.id === l.id));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const byId = id => P.find(p => p.id === id);
  const count = () => cart.reduce((s, l) => s + l.q, 0);
  const subtotal = () => cart.reduce((s, l) => s + byId(l.id).price * l.q, 0);
  function add(id, ci, size, q = 1) {
    const l = cart.find(x => x.id === id && x.ci === ci && x.size === size);
    if (l) l.q = Math.min(10, l.q + q); else cart.push({ id, ci, size, q });
    save(); paintCount();
    const p = byId(id); toast(`${p.name} (${size}) sepete eklendi`);
  }
  function paintCount() {
    const b = $('#cartOpen'); $('#cartCount').textContent = count(); b.setAttribute('aria-label', `Sepet, ${count()} ürün`);
    if (!reduce) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }

  /* ---------- Katalog ---------- */
  let cat = 'hepsi', sort = 'onerilen';
  function renderCats() {
    $('#catChips').innerHTML = CATS.map(c => `<button type="button" role="tab" data-cat="${c.id}" aria-selected="${c.id === cat}">${esc(c.name)}</button>`).join('');
    $('#topNav').innerHTML = CATS.filter(c => c.id !== 'hepsi').map(c => `<a href="#urunler" data-cat="${c.id}" aria-current="${c.id === cat}">${esc(c.name)}</a>`).join('');
  }
  function renderGrid() {
    let list = P.filter(p => cat === 'hepsi' || p.cat === cat);
    if (sort === 'artan') list = list.slice().sort((a, b) => a.price - b.price);
    if (sort === 'azalan') list = list.slice().sort((a, b) => b.price - a.price);
    const cn = CATS.find(c => c.id === cat)?.name || '';
    $('#resultInfo').textContent = cat === 'hepsi' ? `${list.length} ürün` : `${cn}: ${list.length} ürün`;
    $('#grid').innerHTML = list.length ? list.map(p => `<li class="card">
        <button class="card-art" type="button" data-open="${p.id}" aria-label="${esc(p.name)} ayrıntıları">${art(p, 0, { decorative: true })}${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}</button>
        <h3><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
        <div class="card-row"><span class="price">${TL(p.price)}</span>
          <span class="dots" aria-label="${p.colors.length} renk">${p.colors.map(c => `<i style="background:${c.hex}" title="${esc(c.name)}"></i>`).join('')}</span></div>
      </li>`).join('') : '<li class="empty">Bu kategoride ürün yok. Başka bir kategori seçin.</li>';
  }
  function setCat(c) { cat = c; renderCats(); renderGrid(); }

  /* ---------- Ürün ayrıntısı ---------- */
  let cur = null, ci = 0, size = null;
  function paintDetail() {
    $('#dArt').innerHTML = art(cur, ci);
    $('#dColorName').textContent = cur.colors[ci].name;
    $('#dColors').innerHTML = cur.colors.map((c, i) => `<button type="button" data-ci="${i}" aria-pressed="${i === ci}" aria-label="${esc(c.name)}" style="background:${c.alt ? `linear-gradient(135deg,${c.hex} 50%,${c.alt} 50%)` : c.hex}"></button>`).join('');
    $('#dSizes').innerHTML = cur.sizes.map(s => `<button type="button" data-size="${esc(s)}" aria-pressed="${s === size}">${esc(s)}</button>`).join('');
  }
  function openDetail(id) {
    cur = byId(id); if (!cur) return; ci = 0; size = cur.sizes.length === 1 ? cur.sizes[0] : null;
    $('#dTitle').textContent = cur.name; $('#dPrice').textContent = TL(cur.price); $('#dDesc').textContent = cur.desc;
    $('#dMat').textContent = cur.material; $('#dFit').textContent = cur.fit; $('#dHint').textContent = '';
    paintDetail(); $('#detail').showModal();
  }

  /* ---------- Sepet çekmecesi ---------- */
  let done = false;
  function renderCart() {
    const body = $('#cartBody'), foot = $('#cartFoot');
    if (done) {
      body.innerHTML = `<div class="done"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="28" fill="#262d63"/><path d="M17 29l7 7 15-16" stroke="#e0a526" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>Siparişiniz tamamlandı</h3><p>Bu örnek mağazada sipariş oluşturulmaz ve ödeme alınmaz. Sepetiniz temizlendi.</p>
        <button class="btn ghost" type="button" data-close>Alışverişe dön</button></div>`;
      foot.innerHTML = ''; return;
    }
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><p>Sepetiniz boş. Koleksiyondan bir parça seçerek başlayın.</p><button class="btn primary" type="button" data-close data-go="urunler">Koleksiyonu gör</button></div>`;
      foot.innerHTML = ''; return;
    }
    body.innerHTML = cart.map((l, i) => { const p = byId(l.id), c = p.colors[l.ci] || p.colors[0];
      return `<div class="line"><div class="thumb">${art(p, l.ci, { decorative: true })}</div>
        <div><h3>${esc(p.name)}</h3><small>${esc(c.name)} · ${l.size === 'Tek beden' ? 'Tek beden' : 'Beden ' + esc(l.size)}</small>
          <div class="qty" role="group" aria-label="${esc(p.name)} adedi"><button type="button" data-q="${i}" data-d="-1" aria-label="Bir azalt">−</button><output>${l.q}</output><button type="button" data-q="${i}" data-d="1" aria-label="Bir artır">+</button></div></div>
        <div><div class="lp">${TL(p.price * l.q)}</div><button class="rm" type="button" data-rm="${i}">Kaldır</button></div></div>`; }).join('');
    const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : SHIP, left = FREE_SHIP - sub;
    foot.innerHTML = `<div class="sumrow"><span>Ara toplam</span><span>${TL(sub)}</span></div>
      <div class="sumrow"><span>Kargo</span><span>${ship ? TL(ship) : 'Ücretsiz'}</span></div>
      <div class="sumrow total"><span>Toplam</span><span>${TL(sub + ship)}</span></div>
      <p class="ship">${left > 0 ? `Ücretsiz kargo için ${TL(left)} daha ekleyin.` : 'Kargonuz ücretsiz.'}</p>
      <div class="shipbar" aria-hidden="true"><i style="width:${Math.min(100, sub / FREE_SHIP * 100)}%"></i></div>
      <button class="btn primary" type="button" id="checkout">Siparişi tamamla</button>`;
  }

  let tt;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2200); }

  /* ---------- Olaylar ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.cat) { e.preventDefault(); setCat(t.dataset.cat); if (t.tagName === 'A') $('#urunler').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (t.dataset.open) return openDetail(t.dataset.open);
    if (t.dataset.ci) { ci = +t.dataset.ci; return paintDetail(); }
    if (t.dataset.size) { size = t.dataset.size; $('#dHint').textContent = ''; return paintDetail(); }
    if (t.dataset.q) { const l = cart[+t.dataset.q]; l.q = Math.min(10, l.q + +t.dataset.d); if (l.q <= 0) cart.splice(+t.dataset.q, 1); save(); paintCount(); return renderCart(); }
    if (t.dataset.rm) { const l = cart.splice(+t.dataset.rm, 1)[0]; save(); paintCount(); renderCart(); return toast(`${byId(l.id).name} sepetten çıkarıldı`); }
    if (t.hasAttribute('data-close')) { t.closest('dialog')?.close(); if (t.dataset.go) $('#' + t.dataset.go).scrollIntoView(); return; }
    if (t.id === 'cartOpen') { done = false; renderCart(); return $('#cart').showModal(); }
    if (t.id === 'dAdd') { if (!size) { $('#dHint').textContent = 'Sepete eklemek için bir beden seçin.'; return $('#dSizes button')?.focus(); } add(cur.id, ci, size); return $('#detail').close(); }
    if (t.id === 'checkout') { cart = []; save(); paintCount(); done = true; return renderCart(); }
  });
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $('#sort').addEventListener('change', e => { sort = e.target.value; renderGrid(); });

  rail(); renderCats(); renderGrid();
  $('#cartCount').textContent = count(); $('#cartOpen').setAttribute('aria-label', `Sepet, ${count()} ürün`);
})();
