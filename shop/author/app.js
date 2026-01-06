const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";
const DEFAULT_ICON = "https://ojapp.app/shop/author/ojach.png";

const params = new URL(location.href).searchParams;
const author_key = params.get("key");

/* =====================================
   Base64URL → 作者名
===================================== */
function decodeAuthorKey(str) {
  const pad = str.replace(/-/g, "+").replace(/_/g, "/") +
              "===".slice((str.length + 3) % 4);
  const decoded = atob(pad);
  const bytes = new Uint8Array([...decoded].map(c => c.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
}

/* =====================================
   SNS を描画
===================================== */
function renderSNS(data) {
  const snsArea = document.getElementById("snsRow");
  snsArea.innerHTML = "";
const base = "/shop/author/sns-icon/";
/* const snsList = [
   { key: "sns_x", url: data.sns_x, file: "x.svg" },
   { key: "sns_threads", url: data.sns_threads, file: "threads.svg" },
    { key: "sns_insta", url: data.sns_insta, file: "Instagram_Glyph_Black.svg" },
    { key: "sns_booth",   url: data.sns_booth,   file: "booth.svg" },
    { key: "sns_site",    url: data.sns_site,    file: "link.svg" }
  ];*/
  const snsList = [
  { key: "sns_x", url: data.sns_x, svg: SVG_X },
     { key: "sns_x", url: data.sns_x, svg: SVG_dammy },
  { key: "sns_insta", url: data.sns_insta, svg: SVG_INSTAGRAM },
  { key: "sns_threads", url: data.sns_threads, svg: SVG_THREADS },
  { key: "sns_booth", url: data.sns_booth, svg: SVG_BOOTH },
  { key: "sns_site", url: data.sns_site, svg: SVG_LINK }
];
snsList.forEach(s => {
  if (!s.url) return;

  const a = document.createElement("a");
  a.href = s.url;
  a.target = "_blank";
  a.className = "sns-icon";

  a.innerHTML = `
    <div class="svg-wrap">${s.svg}</div>
  `;

  snsArea.appendChild(a);
   });
/*snsList.forEach(s => {
    if (!s.url) return;

    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.className = "sns-icon";

    const img = document.createElement("img");
    img.src = base + s.file;
    img.width = 22;
    img.height = 22;

    a.appendChild(img);
    snsArea.appendChild(a);
  });*/
   
} 
const SVG_dammy =`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4" class="no-invert">
  <circle cx="4" cy="4" r="4" fill="currentColor" />
</svg>`;
 const SVG_X = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1227" fill="none" viewBox="0 0 1200 1227"><path fill="#000" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/></svg>`;             
const SVG_INSTAGRAM =`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 1000 1000" width="100%"><path d="M295.42,6c-53.2,2.51-89.53,11-121.29,23.48-32.87,12.81-60.73,30-88.45,57.82S40.89,143,28.17,175.92c-12.31,31.83-20.65,68.19-23,121.42S2.3,367.68,2.56,503.46,3.42,656.26,6,709.6c2.54,53.19,11,89.51,23.48,121.28,12.83,32.87,30,60.72,57.83,88.45S143,964.09,176,976.83c31.8,12.29,68.17,20.67,121.39,23s70.35,2.87,206.09,2.61,152.83-.86,206.16-3.39S799.1,988,830.88,975.58c32.87-12.86,60.74-30,88.45-57.84S964.1,862,976.81,829.06c12.32-31.8,20.69-68.17,23-121.35,2.33-53.37,2.88-70.41,2.62-206.17s-.87-152.78-3.4-206.1-11-89.53-23.47-121.32c-12.85-32.87-30-60.7-57.82-88.45S862,40.87,829.07,28.19c-31.82-12.31-68.17-20.7-121.39-23S637.33,2.3,501.54,2.56,348.75,3.4,295.42,6m5.84,903.88c-48.75-2.12-75.22-10.22-92.86-17-23.36-9-40-19.88-57.58-37.29s-28.38-34.11-37.5-57.42c-6.85-17.64-15.1-44.08-17.38-92.83-2.48-52.69-3-68.51-3.29-202s.22-149.29,2.53-202c2.08-48.71,10.23-75.21,17-92.84,9-23.39,19.84-40,37.29-57.57s34.1-28.39,57.43-37.51c17.62-6.88,44.06-15.06,92.79-17.38,52.73-2.5,68.53-3,202-3.29s149.31.21,202.06,2.53c48.71,2.12,75.22,10.19,92.83,17,23.37,9,40,19.81,57.57,37.29s28.4,34.07,37.52,57.45c6.89,17.57,15.07,44,17.37,92.76,2.51,52.73,3.08,68.54,3.32,202s-.23,149.31-2.54,202c-2.13,48.75-10.21,75.23-17,92.89-9,23.35-19.85,40-37.31,57.56s-34.09,28.38-57.43,37.5c-17.6,6.87-44.07,15.07-92.76,17.39-52.73,2.48-68.53,3-202.05,3.29s-149.27-.25-202-2.53m407.6-674.61a60,60,0,1,0,59.88-60.1,60,60,0,0,0-59.88,60.1M245.77,503c.28,141.8,115.44,256.49,257.21,256.22S759.52,643.8,759.25,502,643.79,245.48,502,245.76,245.5,361.22,245.77,503m90.06-.18a166.67,166.67,0,1,1,167,166.34,166.65,166.65,0,0,1-167-166.34" transform="translate(-2.5 -2.5)"/></svg>`;
   const SVG_THREADS =`<svg xmlns="http://www.w3.org/2000/svg" aria-label="Threads" viewBox="0 0 192 192"width="100%"><path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553ZM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.114 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274Z" class="threads__x19hqcy"/></svg>`;
   const SVG_BOOTH =`<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 48 48" fill="none">
<path d="M4 5H44V13L42.6015 13.8391C40.3847 15.1692 37.6153 15.1692 35.3985 13.8391L34 13L32.6015 13.8391C30.3847 15.1692 27.6153 15.1692 25.3985 13.8391L24 13L22.6015 13.8391C20.3847 15.1692 17.6153 15.1692 15.3985 13.8391L14 13L12.6015 13.8391C10.3847 15.1692 7.61531 15.1692 5.39853 13.8391L4 13V5Z" fill="#2F88FF" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="6" y="25" width="36" height="18" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 16V25" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M39 16V25" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
   const SVG_LINK =`<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 48 48" fill="none">
<rect width="48" height="48" fill="white" fill-opacity="0.01"/>
<path d="M30 19H20C15.5817 19 12 22.5817 12 27C12 31.4183 15.5817 35 20 35H36C40.4183 35 44 31.4183 44 27C44 24.9711 43.2447 23.1186 42 21.7084" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 24.2916C4.75527 22.8814 4 21.0289 4 19C4 14.5817 7.58172 11 12 11H28C32.4183 11 36 14.5817 36 19C36 23.4183 32.4183 27 28 27H18" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
/* =====================================
   商品数カウント
===================================== */
async function loadItems() {
  const res = await fetch(`${API_BASE}/shop/api/items?sort=new`);
  const items = await res.json();

  const list = items.filter(i => i.author_key === author_key && i.visible === 1);

  // ★ 商品数カウント
  document.getElementById("itemCount").textContent = list.length + " 投稿";

  const grid = document.getElementById("itemGrid");
  grid.innerHTML = "";

  list.forEach(item => {
    const box = document.createElement("div");
      box.className = "grid-item";

      const img = document.createElement("img");
      img.src = `${API_BASE}/shop/r2/thumbs/${author_key}/${item.product_id}.png`;
      img.onerror = () => (img.src = DEFAULT_ICON);

      box.appendChild(img);

      const heart = document.createElement("div");
      heart.className = "grid-heart";
      heart.textContent = "♡" + (item.favorite_count ?? 0); 
      box.appendChild(heart);

      box.onclick = () =>
        (location.href = `/shop/product/?id=${item.product_id}`);

      grid.appendChild(box);
  });
}

/* =====================================
   作者情報ロード
===================================== */
async function loadAuthor() {
  const res = await fetch(`${API_BASE}/shop/api/author_info?key=${author_key}`);
  const data = await res.json();

  // プロフィール画像
  const iconEl = document.getElementById("authorIcon");
  iconEl.src = `${API_BASE}/shop/r2/authors/${author_key}.png`;
  iconEl.onerror = () => (iconEl.src = DEFAULT_ICON);

  // 名前
  document.getElementById("authorName").textContent =
    decodeAuthorKey(author_key);

  // 自己紹介
  document.getElementById("authorProfile").textContent =
    data.profile || "";

  // ★バナ
  const banner = document.getElementById("authorBanner");
  const bannerUrl = `${API_BASE}/shop/r2/banners/${author_key}.png`;

  // 画像が存在するか確認
  fetch(bannerUrl, { method: "HEAD" })
    .then(r => {
      if (r.ok) {
        banner.style.backgroundImage = `url(${bannerUrl})`;
      } else {
        banner.style.display = "none";
      }
    })
    .catch(() => {
      banner.style.display = "none";
    });

  // SNS 読み込み
  renderSNS(data);
}



/* =====================================
   RUN
===================================== */
loadAuthor();
loadItems();

