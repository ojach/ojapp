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

//  折り畳みボタン
document.getElementById("toggle-author-settings")?.addEventListener("click", () => {
  const panel = document.getElementById("author-settings-panel");
  panel.style.display = (panel.style.display === "none") ? "block" : "none";
});

// ===============================
// 作者プロフィール読み込み
// ===============================
async function loadAuthorInfo() {
  const designer = localStorage.getItem("ojshop-admin-designer");
  if (!designer) return;

  // ★ 保存不要、毎回生成する方式
  const author_key = encodeAuthorName(designer);

  const res = await fetch(`${API_BASE}/shop/api/author_info?key=${author_key}`);
  const data = await res.json();

  document.getElementById("author-profile").value = data.profile || "";
  document.getElementById("author-sns-x").value = data.sns_x || "";
  document.getElementById("author-sns-insta").value = data.sns_insta || "";
  document.getElementById("author-sns-threads").value = data.sns_threads || "";
  document.getElementById("author-sns-booth").value = data.sns_booth || "";
  document.getElementById("author-sns-site").value = data.sns_site || "";

  // バナー画像プレビュー
const bannerURL = `${API_BASE}/shop/r2/banners/${author_key}.png`;

fetch(bannerURL, { method: "HEAD" }) // ← 存在チェック
  .then(r => {
    if (r.ok) {
      const img = document.getElementById("author-banner-preview");
      img.src = bannerURL + "?t=" + Date.now();
      img.style.display = "block";
    }
  });

}
// ===============================
//作者プロフィール保存
// ===============================
document.getElementById("author-save-btn")?.addEventListener("click", async () => {
  const designer = localStorage.getItem("ojshop-admin-designer");
  if (!designer) return;

  // ★ 保存不要・毎回生成
  const author_key = encodeAuthorName(designer);

  const payload = {
    author_key,
    profile: document.getElementById("author-profile").value,
    sns_x: document.getElementById("author-sns-x").value,
    sns_insta: document.getElementById("author-sns-insta").value,
    sns_threads: document.getElementById("author-sns-threads").value,
    sns_booth: document.getElementById("author-sns-booth").value,
    sns_site: document.getElementById("author-sns-site").value
  };

  const res = await fetch(`${API_BASE}/shop/api/author_info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  document.getElementById("author-save-result").style.display = "block";
  document.getElementById("author-save-result").textContent = "保存しました！";
});
// ===============================
// バナー アップロード
// ===============================
document.getElementById("author-banner-upload-btn")?.addEventListener("click", async () => {
  const fileInput = document.getElementById("author-banner-file");
  const file = fileInput.files[0];
  if (!file) {
    alert("画像ファイルを選択してください");
    return;
  }

  // === 画像読み込み ===
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  // バナーの最終サイズ
  const TARGET_W = 1092;
  const TARGET_H = 208;
  const targetRatio = TARGET_W / TARGET_H;
  const srcRatio = srcW / srcH;

  let cropW, cropH, cropX, cropY;

  if (srcRatio > targetRatio) {
    // 横長 → 左右カット
    cropH = srcH;
    cropW = cropH * targetRatio;
    cropX = (srcW - cropW) / 2;
    cropY = 0;
  } else {
    // 縦長 → 上下カット
    cropW = srcW;
    cropH = cropW / targetRatio;
    cropX = 0;
    cropY = (srcH - cropH) / 2;
  }

  // === Canvas でクロップ + リサイズ ===
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    bitmap,
    cropX, cropY, cropW, cropH,
    0, 0, TARGET_W, TARGET_H
  );

  // PNG Blob 化
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

  // === サーバーへアップロード ===
  const designer = localStorage.getItem("ojshop-admin-designer");
  const author_key = encodeAuthorName(designer);

  const form = new FormData();
  form.append("author_key", author_key);
  form.append("file", blob, "banner.png");

  const res = await fetch(`${API_BASE}/shop/api/upload_banner`, {
    method: "POST",
    body: form
  });

  const json = await res.json();

  const msg = document.getElementById("author-banner-upload-result");
  msg.style.display = "block";

  if (json.ok) {
    msg.textContent = "バナーをアップロードしました！";

    const img = document.getElementById("author-banner-preview");
    img.src = json.banner_url + "?t=" + Date.now();
    img.style.display = "block";
  } else {
    msg.textContent = "アップロード失敗しました…";
  }
});


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
        <b>❤️ ${item.favorite_count} 👁‍🗨 ${item.view_count}</b><br>
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
window.openEditModal = function(item) {
  const modal = document.getElementById("edit-modal");

  // 値セット（今のまま）
  modal.dataset.id = item.product_id;
  document.getElementById("edit-title").value = item.title;
  document.getElementById("edit-category").value = item.category;
  document.getElementById("edit-url").value = item.product_url;
  document.getElementById("edit-price").value = item.price;
  document.getElementById("edit-visible").value = item.visible ? "1" : "0";

  document.getElementById("edit-thumb-preview").src =
    `${API_BASE}/shop/r2/${item.thumbnail}`;

  // ★ ここで確実にイベントを付ける
modal.querySelector(".modal-close-edit").addEventListener("click", (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
  modal.classList.add("hidden");
});



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


//ショップからの商品管理用
function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
}

function autoOpenFromQuery() {
  const pid = getQueryParam("product");
  if (!pid) return;

  const target = myItemsCache.find(i => i.product_id === pid);
  if (target) {
    setTimeout(() => openEditModal(target), 300);
  }
}

async function start() {
  await loadMyItems();
  autoOpenFromQuery();
  loadAuthorInfo();

}

document.addEventListener("DOMContentLoaded", start);

