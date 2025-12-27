async function loadProduct() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  // APIから商品情報取得
  const res = await fetch(`${API_BASE}/shop/item?id=${id}`);
  const item = await res.json();

  document.getElementById("product-thumb").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  document.getElementById("product-title").textContent = item.title;

  document.getElementById("product-author").textContent = `by ${item.author}`;
  document.getElementById("product-author").href =
    `/shop/author/?key=${item.author_key}`;

  document.getElementById("product-buy").onclick = () => {
    location.href = item.product_url;
  };
}

loadProduct();
