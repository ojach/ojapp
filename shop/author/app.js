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
 const snsList = [
   { key: "sns_x", url: data.sns_x, file: "x.svg" },
  { key: "sns_insta", url: data.sns_insta, file: "Instagram2.svg" },
    { key: "sns_threads", url: data.sns_threads, file: "threads.svg" },
    { key: "sns_booth",   url: data.sns_booth,   file: "booth.svg" },
    { key: "sns_site",    url: data.sns_site,    file: "link.svg" }
  ];
  

 snsList.forEach(s => {
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
  });
}

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

