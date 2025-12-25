// ============================================
// OJapp Shop Admin 2025-12-22 完全版
// （ログイン・アイコン・商品追加・編集モーダル）
// ============================================

const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";
// 商品一覧取得API
async function fetchAllItems() {
  const res = await fetch(`${API_BASE}/shop/api/items`);
  return await res.json();
}

// ===============================
// Base64URL（作者キー）
// ===============================
function encodeAuthorName(name) {
  const utf8 = new TextEncoder().encode(name);
  let bin = "";
  utf8.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}


// ============================================
// ① 新ログイン方式（作者名＋PIN を一度に入力）
// ============================================
(() => {
  const KEY = "ojshop-admin-designer";  // 作者名だけ保存
  const saved = localStorage.getItem(KEY);

  // すでにログイン済みならスキップ
  if (saved) return;

  // 入力 例： ojach7788
  const input = prompt("作者名＋4桁PIN を入力してください。\n例：ojach7788");

  if (!input) {
    alert("キャンセルされました");
    location.href = "/OJapp/shop/";
    return;
  }

  if (input.length < 5) {
    alert("入力が短すぎます。作者名＋4桁PIN です。");
    location.href = "/OJapp/shop/";
    return;
  }

  // 末尾4桁を PIN、それ以外を作者名
  const pin = input.slice(-4);
  const name = input.slice(0, -4);

  // Workers へ照合
  fetch("https://ojshop-fav.trc-wasps.workers.dev/shop/admin/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "check",
      name,
      pin
    })
  })
    .then(r => r.json())
    .then(json => {
      if (!json.ok) {
        alert("ログイン失敗！作者名 または PIN が違います。");
        location.href = "/shop/";
        return;
      }

      // 成功
      localStorage.setItem(KEY, name);
      alert(`ログイン成功！ようこそ ${name} さん`);
      location.reload();
    })
    .catch(err => {
      alert("サーバーエラー：" + err.message);
      location.href = "/shop/";
    });
})();




// ===============================
// ② 作者アイコン UI
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const designer = localStorage.getItem("ojshop-admin-designer");
  const authorKey = encodeAuthorName(designer);
  const box = document.getElementById("author-icon-box");

  const iconURL = `${API_BASE}/shop/r2/authors/${authorKey}.png`;

  const exists = await fetch(iconURL, { method: "HEAD" })
    .then(r => r.ok)
    .catch(() => false);

  if (exists) {
    // 登録済み UI を生成
    box.innerHTML = `
      <h3 class="admin-title">作者アイコン</h3>

      <div class="icon-preview-box">
        <img src="${iconURL}" class="author-icon-img">
      </div>

      <input type="file" id="icon-change-file" accept="image/*">
      <button id="icon-change-btn" class="btn-primary">アイコンを変更する</button>

      <div id="icon-update-result" class="result-box" style="display:none;"></div>
    `;

    // 変更イベント
    document.getElementById("icon-change-btn").addEventListener("click", async () => {
      const f = document.getElementById("icon-change-file").files[0];
      if (!f) return alert("ファイルを選んでください");

      const res = await fetch(
        `${API_BASE}/shop/admin/icon?author_key=${authorKey}`,
        { method: "POST", body: f }
      ).then(r => r.json());

      const result = document.getElementById("icon-update-result");
      result.style.display = "block";
      result.innerHTML = res.ok ? "更新しました！再読み込みしてください。" : "失敗しました。";
    });

  } else {
    // 未登録 UI（初期HTMLのまま使う）
    const preview = document.getElementById("author-icon-preview");
    const input = document.getElementById("author-icon-input");
    const btn = document.getElementById("author-icon-submit");
    const result = document.getElementById("author-icon-result");

    // プレビュー
    input.addEventListener("change", e => {
      const f = e.target.files[0];
      if (!f) return;

      preview.src = URL.createObjectURL(f);
      preview.style.display = "block";
    });

    // 送信
    btn.addEventListener("click", async () => {
      const f = input.files[0];
      if (!f) return alert("ファイルを選んでください");

      const res = await fetch(
        `${API_BASE}/shop/admin/icon?author_key=${authorKey}`,
        { method: "POST", body: f }
      ).then(r => r.json());

      result.style.display = "block";
      result.innerHTML = res.ok ? "登録しました！再読み込みしてください。" : "失敗しました。";
    });
  }
});



// ============================================
// ③ 商品追加プレビュー
// ============================================
document.getElementById("thumb").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const prev = document.getElementById("preview");
  prev.src = URL.createObjectURL(file);
  prev.style.display = "block";
});

// ============================================
// ④ 商品追加（R2 → D1）
// ============================================
document.getElementById("submit").addEventListener("click", async () => {
  const designer = localStorage.getItem("ojshop-admin-designer");
  const author_key = encodeAuthorName(designer);

  const file = document.getElementById("thumb").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const price = Number(document.getElementById("price").value);
  const product_url = document.getElementById("product-url").value;

  if (!file || !title) return alert("画像・タイトルは必須です！");

  const product_id = crypto.randomUUID();

  // ① R2へアップ
  const up = await fetch(
    `${API_BASE}/shop/admin/thumb?product_id=${product_id}&author_key=${author_key}`,
    { method: "POST", body: file }
  ).then(r => r.json());

  if (!up.ok) return alert("画像アップロードに失敗しました");

  // ② D1へ商品登録
  const payload = {
    product_id,
    title,
    author: designer,
    author_key,
    category,
    price,
    product_url,
    thumbnail: `thumbs/${author_key}/${product_id}.png`
  };

  const res = await fetch(`${API_BASE}/shop/admin/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());

  document.getElementById("result").innerHTML = res.ok
    ? `登録完了！<b>${res.product_id}</b>`
    : "エラー発生";
  document.getElementById("result").style.display = "block";

  loadMyItems();
});

// ============================================
// ローカル保持用
// ============================================
let myItemsCache = []; // ← 必須

async function loadMyItems() {
  const designer = localStorage.getItem("ojshop-admin-designer");
  const author_key = encodeAuthorName(designer);

  const box = document.getElementById("my-items");
  box.innerHTML = "<p>読み込み中...</p>";

  let res = await fetch(`${API_BASE}/shop/admin/items?author_key=${author_key}`);
myItemsCache = await res.json();

  // 自分の商品だけフィルタ
myItemsCache = myItemsCache.filter(i => i.author_key === author_key);


  if (myItemsCache.length === 0) {
    box.innerHTML = "<p>まだ商品がありません。</p>";
    return;
  }

  box.innerHTML = "";

  myItemsCache.forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;

    const div = document.createElement("div");
    div.className = "admin-item";

    div.innerHTML = `
      <img src="${thumb}" class="admin-thumb">
      <div class="admin-info">
        <b>${item.title}</b><br>
        <b>${item.price}円 / ${item.category}</b><br>
         <span style="
    font-size:12px;
    font-weight:600;
    color:${item.visible ? "#0a84ff" : "#777"};
  ">
    ${item.visible ? "公開中" : "非公開"}
  </span>
      </div>

      <div class="admin-buttons">
       
        <button class="btn-edit" data-id="${item.product_id}">編集</button>

      </div>
    `;

    box.appendChild(div);
  });

  bindAdminButtons();
}


// ============================================
// ⑥ 管理ボタンのイベント
// ============================================
function bindAdminButtons() {

  // 編集（HTML に存在する）
  document.querySelectorAll(".btn-edit")?.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = myItemsCache.find(i => i.product_id === id);
      openEditModal(item);
    });
  });
}




// ============================================
// ⑦ 編集モーダル
// ============================================
function openEditModal(item) {
  const modal = document.getElementById("edit-modal");

  // 現在の値セット
  modal.dataset.id = item.product_id;
  document.getElementById("edit-title").value = item.title;
  document.getElementById("edit-category").value = item.category;
  document.getElementById("edit-url").value = item.product_url;
  document.getElementById("edit-price").value = item.price;

  // 公開状態
  document.getElementById("edit-visible").value = item.visible ? "1" : "0";

  // サムネ
  document.getElementById("edit-thumb-preview").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  modal.classList.remove("hidden");
}

// ▼ モーダルを閉じる
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("edit-modal");

  document.querySelector(".modal-close-edit").onclick = () => {
    modal.classList.add("hidden");
  };

  document.querySelector("#edit-modal .modal-bg").onclick = () => {
    modal.classList.add("hidden");
  };
});

// ▼ 削除（右下リンク）
document.getElementById("edit-delete").addEventListener("click", async () => {
  const id = document.getElementById("edit-modal").dataset.id;
  if (!confirm("本当に削除しますか？")) return;

  await fetch(`${API_BASE}/shop/admin/delete?id=${id}`, { method: "POST" });

  alert("削除しました！");
  location.reload();
});



// ▼ 保存
document.getElementById("edit-save-top").addEventListener("click", async () => {
  const id = document.getElementById("edit-modal").dataset.id;

  const body = {
    product_id: id,
    title: document.getElementById("edit-title").value,
    category: document.getElementById("edit-category").value,
    product_url: document.getElementById("edit-url").value,
    price: Number(document.getElementById("edit-price").value),
    visible: Number(document.getElementById("edit-visible").value)
  };

  // DB更新
  await fetch(`${API_BASE}/shop/admin/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  alert("保存しました！");
  location.reload();
});


document.addEventListener("DOMContentLoaded", loadMyItems);

