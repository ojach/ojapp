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

 const snsList = [
  {
    url: data.sns_x,
    svg: `<path d="M4 4l6.5 7.5L4 20h3l5.5-6.5L18 20h3l-6.5-8L21 4h-3l-5.5 6.5L7 4H4z"/>`
  },
  {
    url: data.sns_insta,
    svg: `
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17" cy="7" r="1.2"/>
    `
  },
  {
    url: data.sns_threads,
    svg: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3 11c0 2-1.6 3-3 3s-3-1-3-3 1-3 3-3c1 0 2 .5 2 1.5" />`
  },
  {
    url: data.sns_booth,
    svg: `
      <path d="M4 7h16v10H4z"/>
      <path d="M8 7V5h8v2"/>
    `
  },
  {
    url: data.sns_site,
    svg: `
      <path d="M14 3h7v7"/>
      <path d="M21 3l-10 10"/>
      <rect x="3" y="3" width="14" height="14" rx="2"/>
    `
  }
];



  snsList.forEach(s => {
    if (!s.url) return;

    const link = document.createElement("a");
    link.href = s.url;
    link.target = "_blank";
    link.className = "sns-icon";

    link.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           width="22" height="22"
           stroke="currentColor"
           fill="none"
           stroke-width="2">
        ${s.svg}
      </svg>
    `;

    snsArea.appendChild(link);
  });
}

/* =====================================
   作者情報ロード
===================================== */
async function loadAuthor() {
  const res = await fetch(`${API_BASE}/shop/api/author_info?key=${author_key}`);
  const data = await res.json();

  document.getElementById("authorIcon").src =
    `${API_BASE}/shop/r2/authors/${author_key}.png`;

  document.getElementById("authorIcon").onerror = () =>
    (document.getElementById("authorIcon").src = DEFAULT_ICON);

  document.getElementById("authorName").textContent =
    decodeAuthorKey(author_key);

  document.getElementById("authorProfile").textContent =
    data.profile || "";

  // ← SNS描画をここで呼ぶ
  renderSNS(data);
}

/* =====================================
   商品ロード
===================================== */
async function loadItems() {
  const res = await fetch(`${API_BASE}/shop/api/items?sort=new`);
  const items = await res.json();

  const grid = document.getElementById("itemGrid");
  grid.innerHTML = "";

  items
    .filter(i => i.author_key === author_key && i.visible === 1)
    .forEach(item => {
      const box = document.createElement("div");
      box.className = "grid-item";

      const img = document.createElement("img");
      img.src = `${API_BASE}/shop/r2/thumbs/${author_key}/${item.product_id}.png`;
      img.onerror = () => (img.src = DEFAULT_ICON);

      box.appendChild(img);

      const heart = document.createElement("div");
      heart.className = "grid-heart";
      heart.textContent = "♡";
      box.appendChild(heart);

      box.onclick = () =>
        (location.href = `/shop/item/?id=${item.product_id}`);

      grid.appendChild(box);
    });
}

/* =====================================
   RUN
===================================== */
loadAuthor();
loadItems();

