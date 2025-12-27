async function loadProduct() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  const res = await fetch(`${API_BASE}/shop/item?id=${id}`);
  const item = await res.json();

  document.getElementById("p-thumb").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  document.getElementById("p-title").textContent = item.title;
  document.getElementById("p-price").textContent = `${item.price}円`;

  document.getElementById("p-category").textContent =
    item.category ? `・${item.category}` : "";

  document.getElementById("p-author").textContent = `by ${item.author}`;
  document.getElementById("p-author").href =
    `/shop/author/?key=${item.author_key}`;

  document.getElementById("p-fav").textContent =
    `❤️ ${item.favorite_count}`;

  document.getElementById("p-view").textContent =
    `👁 ${item.view_count}`;

  document.getElementById("p-buy").onclick = () => {
    location.href = item.product_url;
  };
}

loadProduct();
