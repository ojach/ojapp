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
  // 長押し保存メニュー禁止（iOS）
  // ===============================
  document.addEventListener("contextmenu", e => {
    if (e.target.id === "product-img") e.preventDefault();
  });

  const productImg = document.getElementById("product-img");
  productImg.style.pointerEvents = "none";  // ← 最強の一撃
  productImg.style.webkitUserSelect = "none";
  productImg.style.userSelect = "none";

  // ===============================
  // 商品表示
  // ===============================

  // 画像
  productImg.src = `${API_BASE}/shop/r2/${item.thumbnail}`;

  // タイトル
  document.getElementById("product-title").textContent = item.title;

  // 作者アイコン + 名前
  const iconEl = document.getElementById("author-icon");
  const nameEl = document.getElementById("author-name");

  iconEl.src = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;
  nameEl.textContent = item.author;

  // バッヂ
  let badge = "";
  if (authorInfo.founder) badge += " ⭐";
  if (authorInfo.supporter) badge += " 💝";

nameEl.textContent = item.author + badge;

  // ===============================
  // 作者ページへ遷移
  // ===============================
  const toAuthorPage = () => {
    location.href = `/shop/author/?key=${item.author_key}`;
  };
  iconEl.addEventListener("click", toAuthorPage);
  nameEl.addEventListener("click", toAuthorPage);

  // ===============================
  // ❤️ お気に入りボタン（1回だけ）
  // ===============================
  const favBtn = document.getElementById("fav-btn");
  const favCountEl = document.getElementById("fav-count");

  // 初期表示
  favCountEl.textContent = item.favorite_count;

  const localKey = `fav_${item.product_id}`;

  // すでに押した？
  if (localStorage.getItem(localKey)) {
    favBtn.textContent = "❤️";
    favBtn.classList.add("active");
    favBtn.style.pointerEvents = "none";
  }

  // 押した時
  favBtn.addEventListener("click", async () => {
    if (localStorage.getItem(localKey)) return;

    favBtn.style.pointerEvents = "none";

    const res = await fetch(`${API_BASE}/shop/api/fav?id=${item.product_id}`, {
      method: "POST"
    });
    const json = await res.json();

    if (json.ok) {
      favBtn.textContent = "❤️";
      favBtn.classList.add("active");
      favCountEl.textContent = json.favorite_count;
      localStorage.setItem(localKey, "1");
    }
  });

  // ===============================
  // 価格
  // ===============================
  const priceEl = document.getElementById("price");
  priceEl.textContent = `${item.price}円`;

  // ===============================
  // ボタン
  // ===============================
  const btn = document.getElementById("buy-btn");
  btn.href = item.product_url;

  if (item.price === 0) {
    btn.textContent = "無料で受け取る";
  } else {
    btn.textContent = "作者の販売サイトへ";
  }

  // ===============================
  // view_count +1
  // ===============================
  fetch(`${API_BASE}/shop/api/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: id })
  });
}

document.addEventListener("DOMContentLoaded", loadProduct);

