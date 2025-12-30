const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";

// GETパラメータ
function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
}

async function loadProduct() {
  const id = getQueryParam("id");
  if (!id) return alert("商品IDがありません");

  // 全件取得
  const res = await fetch(`${API_BASE}/shop/api/items`);
  const allItems = await res.json();

  // 1件抽出
  const item = allItems.find(i => i.product_id === id);
  if (!item) {
    alert("商品が見つかりません");
    return;
  }

  // ---- ここから表示 ----

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
  // --- view_count +1 ---
// --- view_count +1 ---
fetch(`${API_BASE}/shop/api/view`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ product_id: id })
});



}

document.addEventListener("DOMContentLoaded", loadProduct);
