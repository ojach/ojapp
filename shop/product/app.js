const API_BASE = "https://ojapp.app"; // ← いつもの

// GETパラメータ
function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
}

async function loadProduct() {
  const id = getQueryParam("id");
  if (!id) return alert("商品IDが指定されていません");

  // ① 商品情報取得
  const res = await fetch(`${API_BASE}/shop/item?id=${id}`);
  const item = await res.json();

  // ② 表示反映
  document.getElementById("product-img").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  document.getElementById("product-title").textContent = item.title;

  document.getElementById("author-icon").src =
    `${API_BASE}/shop/r2/authors/${item.author_key}.png`;

  document.getElementById("author-name").textContent = item.author;

  document.getElementById("fav-count").textContent =
    `❤️ ${item.favorite_count}`;

  document.getElementById("view-count").textContent =
    `👁 ${item.view_count}`;

  document.getElementById("buy-btn").href = item.product_url;

  // ③ view_count +1（正しいタイミング）
  fetch(`${API_BASE}/shop/item/view?id=${id}`, { method: "POST" });
}

document.addEventListener("DOMContentLoaded", loadProduct);
