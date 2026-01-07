export async function onRequest(context) {
  const API = "https://ojshop-fav.trc-wasps.workers.dev";

  const res = await fetch(`${API}/shop/api/items`);
  const items = await res.json();

  const authors = [...new Set(items.map(i => i.author_key))];

  let urls = `
  <url>
    <loc>https://ojapp.app/shop/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  `;

  items.forEach(i => {
    urls += `
    <url>
      <loc>https://ojapp.app/shop/product/?id=${i.product_id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });

  authors.forEach(key => {
    urls += `
    <url>
      <loc>https://ojapp.app/shop/author/?key=${key}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
