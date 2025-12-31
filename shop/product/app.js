const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";

// GETパラメータ
function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
}

async function loadProduct() {
  const id = getQueryParam("id");
  if (!id) return alert("商品IDがありません");

  // 商品一覧を取得
  const res = await fetch(`${API_BASE}/shop/api/items`);
  const allItems = await res.json();

  // 対象商品
  const item = allItems.find(i => i.product_id === id);
  if (!item) {
    alert("商品が見つかりません");
    return;
  }

  // ===============================
  //  商品表示
  // ===============================

  // 画像
  document.getElementById("product-img").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  // タイトル
  document.getElementById("product-title").textContent = item.title;

  // 作者アイコン + 名前
  const iconEl = document.getElementById("author-icon");
  const nameEl = document.getElementById("author-name");

  iconEl.src = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;
  nameEl.textContent = item.author;

  // ===============================
  //  作者ページへ遷移（← NEW）
  // ===============================

  const toAuthorPage = () => {
    location.href = `/shop/author/?key=${item.author_key}`;
  };

  iconEl.addEventListener("click", toAuthorPage);
  nameEl.addEventListener("click", toAuthorPage);

// ===============================
// ❤️ お気に入りボタン
// ===============================
const favBtn = document.getElementById("fav-btn");
const favCountEl = document.getElementById("fav-count");

// 初期表示（数字だけ）
favCountEl.textContent = item.favorite_count;

// すでに押した？
if (localStorage.getItem(`liked_${item.product_id}`)) {
  favBtn.textContent = "❤️";
  favBtn.style.pointerEvents = "none";
}

// 押した時
favBtn.addEventListener("click", async () => {
  if (localStorage.getItem(`liked_${item.product_id}`)) return;

  favBtn.style.pointerEvents = "none";

  const res = await fetch(`${API_BASE}/shop/api/fav?id=${item.product_id}`, {
    method: "POST"
  });
  const json = await res.json();

  if (json.ok) {
    favCountEl.textContent = json.favorite_count;
    favBtn.textContent = "❤️";
    localStorage.setItem(`liked_${item.product_id}`, "1");
  }
});

  // ===============================
  //  価格
  // ===============================
  const priceEl = document.getElementById("price");
  priceEl.textContent = `${item.price}円`;

  // ===============================
  //  ボタン（無料/有料）
  // ===============================
  const btn = document.getElementById("buy-btn");
  btn.href = item.product_url;

  if (item.price === 0) {
    btn.textContent = "無料で受け取る";
  } else {
    btn.textContent = "作者の販売サイトへ";
  }

  // ===============================
  //  view_count +1
  // ===============================
  fetch(`${API_BASE}/shop/api/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: id })
  });
}

document.addEventListener("DOMContentLoaded", loadProduct);

