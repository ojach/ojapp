// ============================================
// OJapp Shop 2025-12-22 完全安定版（D1 + R2 + Admin）
// ============================================

const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";
const FAV_VERSION = "v2";

// admin判定
const ADMIN_NAME = localStorage.getItem("ojshop-admin-designer");
const IS_ADMIN = Boolean(ADMIN_NAME);

let items = [];
let viewItems = [];


// ===============================
// 商品一覧取得
// ===============================
async function loadItems() {
  const res = await fetch(`${API_BASE}/shop/api/items`);
  return await res.json();
}


// ===============================
// お気に入り（色復元）
// ===============================
function loadFavorites() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    const id = btn.dataset.id;
    const key = `fav_${id}`;

    if (localStorage.getItem(key)) {
      btn.classList.add("active");
      btn.textContent = "❤️";
    }
  });
}


// ===============================
// 推しアイテム（2件固定）
// ===============================
async function renderRecommend() {
  const res = await fetch(`${API_BASE}/shop/api/items?sort=recommended`);
  const data = await res.json();

  const box = document.getElementById("recommend-box");
  if (!box) return;

  box.innerHTML = "";

  data.slice(0, 2).forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
    const icon  = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;

    const div = document.createElement("div");
    div.className = "recommend-item";
    div.innerHTML = `
      <img src="${thumb}" class="recommend-thumb">
      <div class="recommend-title">${item.title}</div>
      <div class="recommend-author">
        <img src="${icon}" class="recommend-author-icon"> ${item.author}
      </div>
    `;

    div.addEventListener("click", () => {
      location.href = `/shop/product/?id=${item.product_id}`;
    });

    box.appendChild(div);
  });
}


// ===============================
// フィルタ UI
// ===============================
function renderDynamicFilters() {
  const categories = new Set(["all"]);
  const authors = new Set(["all"]);

  items.forEach(i => {
    if (i.category) categories.add(i.category);
    if (i.author) authors.add(i.author);
  });

  const category = document.getElementById("filter-category");
  const author   = document.getElementById("filter-author");
  const price    = document.getElementById("filter-price");

  if (!category) return;

  category.innerHTML = "";
  author.innerHTML = "";
  price.innerHTML = "";

  [...categories].forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c === "all" ? "全て" : c;
    category.appendChild(o);
  });

  [...authors].forEach(a => {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a === "all" ? "全て" : a;
    author.appendChild(o);
  });

  [
    ["all", "全価格帯"],
    ["free", "無料"],
    ["under500", "〜¥500"],
    ["over500", "¥501〜"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    price.appendChild(o);
  });
}


// ===============================
// ソート + 絞り込み
// ===============================
async function applyFilters() {

  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  let sortKey = sort;
  if (sort === "fav") sortKey = "popular";
  if (sort === "random") sortKey = "recommended";

  const res = await fetch(`${API_BASE}/shop/api/items?sort=${sortKey}`);
  let data = await res.json();

  // 絞り込み
  const selectedCategory = document.getElementById("filter-category").value;
  const selectedAuthor   = document.getElementById("filter-author").value;
  const selectedPrice    = document.getElementById("filter-price").value;

  data = data.filter(item => {

    if (selectedCategory !== "all" && item.category !== selectedCategory)
      return false;

    if (selectedAuthor !== "all" && item.author !== selectedAuthor)
      return false;

    if (selectedPrice === "free" && item.price !== 0) return false;
    if (selectedPrice === "under500" && (item.price < 1 || item.price > 500)) return false;
    if (selectedPrice === "over500" && item.price < 501) return false;

    return true;
  });

  viewItems = data.slice(0, 20);
}


// ===============================
// 商品グリッド（admin UI 出し分け）
// ===============================
async function renderShop() {
  const grid = document.getElementById("shop-list");
  grid.innerHTML = "";

  viewItems.forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
    const icon  = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;

    const card = document.createElement("div");
    card.className = "item-card";

const isOwner = (item.author === ADMIN_NAME);


const adminTools = (IS_ADMIN && isOwner) ? `
  <div class="admin-tools">
    <button class="admin-edit-btn" data-id="${item.product_id}">編集</button>
  </div>
` : "";





    card.innerHTML = `
      ${adminTools}

      <div class="item-thumb-box">
        <img src="${thumb}" class="item-thumb">
        <img src="${icon}" class="author-icon">
      </div>

      <div class="item-title">${item.title}</div>

      <div class="item-meta">
        <div class="item-price">${item.price}円</div>
        <div class="item-author">${item.author}</div>
      </div>

      <div class="fav-zone">
        <span class="fav-btn" data-id="${item.product_id}">🤍</span>
        <span class="fav-count" data-id="${item.product_id}">
          ${item.favorite_count}
        </span>
      </div>
    `;

    // ===============================
    // イベント
    // ===============================

    // 商品ページ
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("fav-btn")) return;
      if (e.target.closest(".admin-tools")) return; // admin UIクリック時は移動しない
      location.href = `/shop/product/?id=${item.product_id}`;
    });

    // ハート押し
    card.querySelector(".fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(e.target);
    });

 // ★ Admin の公開/非公開（ボタンがある場合だけ動く）
if (IS_ADMIN) {
  const btn = card.querySelector(".admin-visible-btn");
  if (btn) {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await toggleVisible(item.product_id, !item.visible);
      start(); // 再描画
    });
  }
}

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add("show"));
  });

  loadFavorites();
}


// ===============================
// Admin: 公開/非公開 切替
// ===============================
async function toggleVisible(id, newState) {
  await fetch(`${API_BASE}/shop/admin/visible?id=${id}&v=${newState ? 1 : 0}`);
}


// ===============================
// ハート押し（1回だけ）
// ===============================
async function toggleFav(btn) {
  const id = btn.dataset.id;
  const key = `fav_${id}`;

  if (localStorage.getItem(key)) return;

  btn.classList.add("active");
  btn.textContent = "❤️";

  const res = await fetch(`${API_BASE}/shop/api/fav?id=${id}`, {
    method: "POST"
  });

  const data = await res.json();

  const countEl = document.querySelector(`.fav-count[data-id="${id}"]`);
  if (countEl) countEl.textContent = data.favorite_count;

  localStorage.setItem(key, "1");
}


// ===============================
// 人気/おすすめスクロール
// ===============================
async function loadScrollRows() {

  // 人気
  {
    const res = await fetch(`${API_BASE}/shop/api/items?sort=views`);
    const data = await res.json();

    const wrap = document.getElementById("scroll-popular");
    if (wrap) {
      wrap.innerHTML = data.map(item => `
        <div class="scroll-item"
             onclick="location.href='/shop/product/?id=${item.product_id}'">
          <img src="${API_BASE}/shop/r2/${item.thumbnail}" class="scroll-thumb">
          <div class="scroll-title-text">${item.title}</div>
        </div>
      `).join("");
    }
  }

  // おすすめ（ランダム）
  {
    const res = await fetch(`${API_BASE}/shop/api/items?sort=recommended`);
    const data = await res.json();

    const wrap = document.getElementById("scroll-recommend");
    if (wrap) {
      wrap.innerHTML = data.map(item => `
        <div class="scroll-item"
             onclick="location.href='/shop/product/?id=${item.product_id}'">
          <img src="${API_BASE}/shop/r2/${item.thumbnail}" class="scroll-thumb">
          <div class="scroll-title-text">${item.title}</div>
        </div>
      `).join("");
    }
  }
}


// ===============================
// 初期スタート
// ===============================
async function start() {
  items = await loadItems();
  viewItems = [...items];

  renderRecommend();
  renderDynamicFilters();
  await applyFilters();
  loadScrollRows();
  renderShop();
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("admin-edit-btn")) {
    const id = Number(e.target.dataset.id);
    const item = viewItems.find(i => i.product_id === id);
    if (item) openEditModal(item);
  }
});


// ===============================
// ソートタブ
// ===============================
document.querySelectorAll(".shop-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    applyFilters().then(renderShop);
  });
});

document.addEventListener("DOMContentLoaded", start);
