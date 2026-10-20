/* DOĞU — örnek mağaza: katalog, ürün detayı, sepet (tarayıcıda saklanır) */
(() => {
  'use strict';
  const P = window.DOGU_PRODUCTS || [], CATS = window.DOGU_CATS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tl = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
  const TL = n => tl.format(Math.round(n)) + ' ₺';
  const FREE_SHIP = 1500, SHIP = 89;
  const KEY = 'DOGU_CART_V1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Çizimler: her ürün kendi çini deseniyle ---------- */
  const star = (cx, cy, s, attrs) => {             // sekiz köşeli Selçuklu yıldızı (iki kare)
    const h = s / 2;
    return `<g ${attrs}><rect x="${cx - h}" y="${cy - h}" width="${s}" height="${s}"/><rect x="${cx - h}" y="${cy - h}" width="${s}" height="${s}" transform="rotate(45 ${cx} ${cy})"/></g>`;
  };
  const MOTIF = {
    yildiz: ([a, b, c]) => star(200, 200, 150, `fill="${a}"`) + star(200, 200, 84, `fill="#fff"`) + star(200, 200, 56, `fill="${c}"`) + `<circle cx="200" cy="200" r="12" fill="${b}"/>`,
    lale: ([a, b, c]) => `<path d="M200 300 C198 260 200 230 200 196" stroke="${b}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M200 286 C170 280 150 254 146 226 C176 232 196 252 200 286Z M200 266 C226 260 244 240 250 214 C224 220 204 238 200 266Z" fill="${b}"/>
      <path d="M200 200 C176 196 160 172 164 132 C178 146 188 156 200 176 C212 156 222 146 236 132 C240 172 224 196 200 200Z" fill="${c}"/>
      <path d="M200 182 C192 160 192 134 200 104 C208 134 208 160 200 182Z" fill="${a}"/>`,
    cintemani: ([a, b, c]) => `<g fill="${b}"><circle cx="172" cy="150" r="22"/><circle cx="228" cy="150" r="22"/><circle cx="200" cy="196" r="22"/></g>
      <g fill="none" stroke="${a}" stroke-width="9" stroke-linecap="round"><path d="M136 240 q16 -16 32 0 t32 0 t32 0 t32 0"/><path d="M136 270 q16 -16 32 0 t32 0 t32 0 t32 0"/></g>`,
    dalga: ([a, b]) => `<g fill="none" stroke-linecap="round" stroke-width="10">${[0, 1, 2, 3].map(i => `<path stroke="${i % 2 ? b : a}" d="M108 ${150 + i * 32} q23 -22 46 0 t46 0 t46 0 t46 0"/>`).join('')}</g>`,
    gul: ([a, b, c]) => `${Array.from({ length: 8 }, (_, i) => { const t = i * Math.PI / 4; return `<circle cx="${200 + Math.cos(t) * 56}" cy="${200 + Math.sin(t) * 56}" r="30" fill="${i % 2 ? b : a}"/>`; }).join('')}<circle cx="200" cy="200" r="34" fill="#fff"/><circle cx="200" cy="200" r="20" fill="${c}"/>`,
    elibelinde: ([a, b, c]) => `<path d="M200 112 L248 160 L222 200 L248 240 L200 288 L152 240 L178 200 L152 160Z" fill="${a}"/><path d="M200 150 L222 200 L200 250 L178 200Z" fill="${c}"/>
      <g fill="${b}"><rect x="118" y="190" width="20" height="20" transform="rotate(45 128 200)"/><rect x="262" y="190" width="20" height="20" transform="rotate(45 272 200)"/></g>`,
    nar: ([a, b, c]) => `<circle cx="200" cy="214" r="74" fill="${a}"/><path d="M178 146 L186 126 L200 140 L214 126 L222 146Z" fill="${a}"/>
      <g fill="#fff">${[[176, 196], [200, 190], [224, 196], [188, 222], [212, 222], [200, 248]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="10"/>`).join('')}</g><path d="M232 146 C252 128 276 130 286 146 C266 154 248 154 232 146Z" fill="${b}"/>`,
    nazar: ([a, b]) => `<circle cx="200" cy="200" r="92" fill="${a}"/><circle cx="200" cy="200" r="62" fill="#fff"/><circle cx="200" cy="200" r="42" fill="${b}"/><circle cx="200" cy="200" r="20" fill="#121a33"/>`,
  };
  function art(p, id) {
    const [a, b, c] = p.colors, pid = 'pt-' + id;
    if (p.motif === 'cizgi') {                        // dokuma: çizgili kumaş yüzeyi
      const bands = [a, '#fff', b, '#fff', a, c, a, '#fff', b, '#fff', a];
      return `<svg viewBox="0 0 400 400" role="img" aria-label="${esc(p.name)} deseni"><rect width="400" height="400" fill="${c}"/>
        ${bands.map((col, i) => `<rect x="0" y="${30 + i * 31}" width="400" height="${i % 2 ? 9 : 22}" fill="${col}"/>`).join('')}
        <g stroke="#fff" stroke-width="2" opacity=".55">${Array.from({ length: 40 }, (_, i) => `<line x1="${8 + i * 10}" y1="372" x2="${8 + i * 10}" y2="400"/>`).join('')}</g></svg>`;
    }
    return `<svg viewBox="0 0 400 400" role="img" aria-label="${esc(p.name)} deseni">
      <defs><pattern id="${pid}" width="50" height="50" patternUnits="userSpaceOnUse">${star(25, 25, 16, 'fill="#fff" opacity=".13"')}</pattern></defs>
      <rect width="400" height="400" fill="${a}"/><rect width="400" height="400" fill="url(#${pid})"/>
      <rect x="18" y="18" width="364" height="364" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      <circle cx="200" cy="200" r="132" fill="#fff"/><circle cx="200" cy="200" r="132" fill="none" stroke="${b}" stroke-width="5"/>
      ${(MOTIF[p.motif] || MOTIF.yildiz)(p.colors)}</svg>`;
  }

  /* Hero: yıldız-haç geçmeli çini yüzeyi; tek mercan yıldız */
  function hero() {
    const el = $('#heroTile'); if (!el) return;
    const S = 120, out = [];
    out.push('<rect width="480" height="480" fill="#f2f4f9"/>');
    for (let y = 0; y <= 4; y++) for (let x = 0; x <= 4; x++) {
      const cx = x * S, cy = y * S, hot = x === 3 && y === 1, d = reduce ? 0 : (x + y) * 70;
      out.push(`<g class="t-star" style="${reduce ? '' : `opacity:0;animation:tin .6s ${d}ms forwards`}">${star(cx, cy, 84, `fill="${hot ? '#c8372d' : '#1f3a93'}"`)}${star(cx, cy, 44, 'fill="#fff"')}<circle cx="${cx}" cy="${cy}" r="9" fill="${hot ? '#1f3a93' : '#c8372d'}"/></g>`);
    }
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const cx = x * S + S / 2, cy = y * S + S / 2;
      out.push(`<rect x="${cx - 9}" y="${cy - 9}" width="18" height="18" transform="rotate(45 ${cx} ${cy})" fill="#1f7f7c"/>`);
    }
    el.innerHTML = `<style>@keyframes tin{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}</style>` + out.join('');
  }

  /* ---------- Sepet durumu ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const byId = id => P.find(p => p.id === id);
  const lines = () => Object.entries(cart).map(([id, q]) => ({ p: byId(id), q })).filter(x => x.p && x.q > 0);
  const count = () => lines().reduce((s, x) => s + x.q, 0);
  const subtotal = () => lines().reduce((s, x) => s + x.p.price * x.q, 0);

  function add(id, q = 1) {
    cart[id] = Math.min(20, (cart[id] || 0) + q); save(); paintCount();
    const p = byId(id); toast(`${p.name} sepete eklendi`);
  }
  function setQty(id, q) { if (q <= 0) delete cart[id]; else cart[id] = Math.min(20, q); save(); paintCount(); renderCart(); }

  function paintCount() {
    const b = $('#cartOpen'); $('#cartCount').textContent = count();
    b.setAttribute('aria-label', `Sepet, ${count()} ürün`);
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
    $('#grid').innerHTML = list.length ? list.map((p, i) => `<li class="card">
        <button class="card-art" type="button" data-open="${p.id}" aria-label="${esc(p.name)} ayrıntıları">${art(p, 'g' + i)}</button>
        <p class="card-region">${esc(p.region)} · ${esc(p.craft)}</p>
        <h3><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
        <div class="card-row"><span class="price">${TL(p.price)}</span><button class="add" type="button" data-add="${p.id}">Sepete ekle</button></div>
      </li>`).join('') : '<li class="empty">Bu kategoride ürün yok. Başka bir kategori seçin.</li>';
  }
  function setCat(c) { cat = c; renderCats(); renderGrid(); }

  /* ---------- Ürün detayı ---------- */
  let cur = null, qty = 1;
  function openDetail(id) {
    cur = byId(id); if (!cur) return; qty = 1;
    $('#dArt').innerHTML = art(cur, 'd');
    $('#dOrigin').textContent = `${cur.region} · ${cur.craft}`;
    $('#dTitle').textContent = cur.name;
    $('#dPrice').textContent = TL(cur.price);
    $('#dDesc').textContent = cur.desc;
    $('#dSize').textContent = cur.size;
    $('#dCraft').textContent = cur.craft;
    $('#qVal').textContent = qty;
    $('#detail').showModal();
  }

  /* ---------- Sepet çekmecesi ---------- */
  let done = false;
  function renderCart() {
    const L = lines(), body = $('#cartBody'), foot = $('#cartFoot');
    if (done) {
      body.innerHTML = `<div class="done"><svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#1f3a93"><rect x="18" y="18" width="28" height="28"/><rect x="18" y="18" width="28" height="28" transform="rotate(45 32 32)"/></g><path d="M23 33l6 6 12-13" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>Siparişiniz tamamlandı</h3><p>Bu örnek mağazada sipariş oluşturulmaz ve ödeme alınmaz. Sepetiniz temizlendi.</p>
        <button class="btn ghost" type="button" data-close>Alışverişe dön</button></div>`;
      foot.innerHTML = ''; return;
    }
    if (!L.length) {
      body.innerHTML = `<div class="cart-empty"><p>Sepetiniz boş. Koleksiyondan bir parça seçerek başlayın.</p><button class="btn primary" type="button" data-close data-go="urunler">Koleksiyonu gör</button></div>`;
      foot.innerHTML = ''; return;
    }
    body.innerHTML = L.map(({ p, q }, i) => `<div class="line">${art(p, 'c' + i)}
        <div><h3>${esc(p.name)}</h3><small>${esc(p.region)} · ${TL(p.price)}</small>
          <div class="qty" role="group" aria-label="${esc(p.name)} adedi"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Bir azalt">−</button><output>${q}</output><button type="button" data-q="${p.id}" data-d="1" aria-label="Bir artır">+</button></div></div>
        <div><div class="lp">${TL(p.price * q)}</div><button class="rm" type="button" data-rm="${p.id}">Kaldır</button></div></div>`).join('');
    const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : SHIP, left = FREE_SHIP - sub;
    foot.innerHTML = `<div class="sumrow"><span>Ara toplam</span><span>${TL(sub)}</span></div>
      <div class="sumrow"><span>Kargo</span><span>${ship ? TL(ship) : 'Ücretsiz'}</span></div>
      <div class="sumrow total"><span>Toplam</span><span>${TL(sub + ship)}</span></div>
      <p class="ship">${left > 0 ? `Ücretsiz kargo için ${TL(left)} daha ekleyin.` : 'Kargonuz ücretsiz.'}</p>
      <div class="shipbar" aria-hidden="true"><i style="width:${Math.min(100, sub / FREE_SHIP * 100)}%"></i></div>
      <button class="btn primary" type="button" id="checkout">Siparişi tamamla</button>`;
  }
  function openCart() { done = false; renderCart(); $('#cart').showModal(); }

  /* ---------- Ustalar ---------- */
  const REGIONS = [
    { n: 'Kütahya', w: 'Çini ve el boyaması seramik', t: 'Sıraltı boyamanın sürdüğü atölyelerden kase, fincan ve mumluklar. Her desen fırçayla, tek tek çizilir.', c: 'seramik' },
    { n: 'İznik', w: 'Kuvars çini', t: 'Kuvars ağırlıklı hamuruyla bilinen geleneğin bugünkü ustalarından tabak ve vazolar.', c: 'seramik' },
    { n: 'Buldan ve Denizli', w: 'El tezgâhı dokuma', t: 'Pamuk peştemaller ve keten örtüler, ahşap tezgâhlarda metre metre dokunur.', c: 'tekstil' },
    { n: 'Avanos', w: 'Kızılırmak kili', t: 'Çarkta çekilen sürahi ve kaplar; nehrin kırmızı kili, odun fırınında pişer.', c: 'seramik' },
    { n: 'Gaziantep', w: 'Dövme bakır', t: 'Cezveler bakır levhadan elde dövülür, içi kalaylanır.', c: 'mutfak' },
    { n: 'Nazarköy', w: 'Üflemeli cam', t: 'Nazarlıklar köyün fırınlarında, camın rengi elde katlanarak üflenir.', c: 'hediye' },
  ];
  function renderRegions() {
    $('#regions').innerHTML = REGIONS.map(r => `<article class="region"><h3>${esc(r.n)}</h3><p class="what">${esc(r.w)}</p><p>${esc(r.t)}</p>
      <button class="n" type="button" data-cat-go="${r.c}">${esc(CATS.find(c => c.id === r.c)?.name || '')} ürünlerini gör</button></article>`).join('');
  }

  /* ---------- Bildirim ---------- */
  let tt;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2200); }

  /* ---------- Olaylar ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.cat) { e.preventDefault(); setCat(t.dataset.cat); if (t.tagName === 'A') $('#urunler').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (t.dataset.catGo) { setCat(t.dataset.catGo); $('#urunler').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (t.dataset.open) return openDetail(t.dataset.open);
    if (t.dataset.add) return add(t.dataset.add);
    if (t.dataset.q) return setQty(t.dataset.q, (cart[t.dataset.q] || 0) + +t.dataset.d);
    if (t.dataset.rm) { const p = byId(t.dataset.rm); setQty(t.dataset.rm, 0); return toast(`${p.name} sepetten çıkarıldı`); }
    if (t.hasAttribute('data-close')) { t.closest('dialog')?.close(); if (t.dataset.go) $('#' + t.dataset.go).scrollIntoView(); return; }
    if (t.id === 'cartOpen') return openCart();
    if (t.id === 'qMinus') { qty = Math.max(1, qty - 1); $('#qVal').textContent = qty; return; }
    if (t.id === 'qPlus') { qty = Math.min(20, qty + 1); $('#qVal').textContent = qty; return; }
    if (t.id === 'dAdd') { add(cur.id, qty); $('#detail').close(); return; }
    if (t.id === 'checkout') { cart = {}; save(); paintCount(); done = true; renderCart(); return; }
  });
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $('#sort').addEventListener('change', e => { sort = e.target.value; renderGrid(); });

  hero(); renderCats(); renderGrid(); renderRegions();
  $('#cartCount').textContent = count(); $('#cartOpen').setAttribute('aria-label', `Sepet, ${count()} ürün`);
})();
