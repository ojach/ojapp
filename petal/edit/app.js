/* ============================================
   Petal Edit Page — Safari 完全対応版
   SNS：10枠固定（必要な数だけ表示）
============================================ */

let PROFILE = null;
let snsList = [];
let blocks = [
  { title: "", text: "", img: "", link: "" },
  { title: "", text: "", img: "", link: "" },
  { title: "", text: "", img: "", link: "" }
];

/* -------------------------------------------
   DOM Ready
------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add_sns_btn").addEventListener("click", addSNS);
  loadProfile();
});

/* -------------------------------------------
   プロフィール読込
------------------------------------------- */
async function loadProfile() {
  const res = await fetch("/api/get_profile/@me");
  if (!res.ok) return alert("ログインが必要です");

  const json = await res.json();
  if (!json.ok) return alert("読み込みエラー");

  PROFILE = json.profile;

  // 基本情報
  document.getElementById("display_name").value = PROFILE.display_name || "";
  document.getElementById("bio").value = PROFILE.bio || "";
  document.getElementById("namecard_link").value = PROFILE.namecard_link || "";
  document.getElementById("petal_enabled").checked = PROFILE.petal_enabled === 1;
  document.getElementById("page_public").checked = PROFILE.page_public === 1;

  if (PROFILE.icon_url) {
    document.getElementById("icon_preview").src = PROFILE.icon_url;
  }

  // SNSは最大10個を確保
  snsList = Array.isArray(PROFILE.sns_links)
    ? [...PROFILE.sns_links]
    : [];

  renderSNS();

  // Blocks
  if (PROFILE.blocks) blocks = PROFILE.blocks;
  renderBlocks();
}

/* -------------------------------------------
   SNS（10枠固定 + Safari対応）
------------------------------------------- */

/* SNS追加（最大10） */
function addSNS() {
  if (snsList.length >= 10) {
    return alert("SNSリンクは最大10個までです");
  }
  snsList.push({ url: "" });
  renderSNS();
}

function renderSNS() {
  // SNS は HTML 上で 10 枠固定
  for (let i = 0; i < 10; i++) {
    const row = document.getElementById(`sns_${i}`);
    const input = document.getElementById(`sns_input_${i}`);
    const del = document.getElementById(`sns_del_${i}`);

    if (!row) continue;

    if (i < snsList.length) {
      row.classList.remove("sns-hidden");
      input.value = snsList[i].url;

      // 入力変更
      input.oninput = () => {
        snsList[i].url = input.value;
      };

      // 削除
      del.onclick = () => {
        snsList.splice(i, 1);
        renderSNS();
      };

    } else {
      row.classList.add("sns-hidden");
      input.value = "";
    }
  }
}

/* -------------------------------------------
   ブロック UI
------------------------------------------- */
function renderBlocks() {
  const area = document.getElementById("card_area");
  area.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const b = blocks[i] ?? {};

    area.innerHTML += `
      <div class="block-editor">
        <h4>ブロック ${i + 1}</h4>

        <label>タイトル</label>
        <input type="text" id="block_title_${i}" value="${b.title || ""}">

        <label>本文</label>
        <textarea id="block_text_${i}">${b.text || ""}</textarea>

        <label>画像（アップロード or URL）</label>
        <img id="block_preview_${i}"
             src="${b.img || ""}"
             style="width:120px;height:auto;display:${b.img ? "block" : "none"};margin-bottom:8px;border-radius:8px;">

        <input type="text"
               id="block_img_${i}"
               value="${b.img || ""}"
               placeholder="画像URL（または下のアップロード）"
               oninput="blocks[${i}].img = this.value">

        <input type="file"
               id="block_file_${i}"
               accept="image/*"
               onchange="uploadBlockImage(${i})">

        <label>リンクURL</label>
        <input type="text" id="block_link_${i}" value="${b.link || ""}">
      </div>
    `;
  }
}

/* -------------------------------------------
   アイコンアップロード
------------------------------------------- */
async function uploadIcon() {
  const uid = Number(localStorage.getItem("user_id"));
  if (!uid) return alert("ログインが必要");

  const file = document.getElementById("icon_file").files[0];
  if (!file) return alert("ファイルを選択してください");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("user_id", uid);

  const res = await fetch("/api/upload_icon", { method: "POST", body: fd });
  const json = await res.json();

  if (!json.ok) return alert("アップロード失敗");

  document.getElementById("icon_preview").src = json.url;
  localStorage.setItem("icon_url", json.url);

  alert("アイコンを更新しました！");
}

/* -------------------------------------------
   保存処理
------------------------------------------- */
async function saveProfile() {
  const uid = Number(localStorage.getItem("user_id"));
  if (!uid) return alert("ログインが必要");

  const newBlocks = [];
  for (let i = 0; i < 3; i++) {
    newBlocks.push({
      title: document.getElementById(`block_title_${i}`).value.trim(),
      text: document.getElementById(`block_text_${i}`).value.trim(),
      img: document.getElementById(`block_img_${i}`).value.trim(),
      link: document.getElementById(`block_link_${i}`).value.trim()
    });
  }

  const body = {
    user_id: uid,
    icon_url: localStorage.getItem("icon_url") || PROFILE?.icon_url || "",
    display_name: document.getElementById("display_name").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    namecard_link: document.getElementById("namecard_link").value.trim(),

    // 空欄ではないものだけ
    sns_links: snsList.filter(s => s.url && s.url.trim() !== ""),

    blocks: newBlocks,
    petal_enabled: document.getElementById("petal_enabled").checked ? 1 : 0,
    page_public: document.getElementById("page_public").checked ? 1 : 0
  };

  const res = await fetch("/api/update_profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  if (!json.ok) return alert("保存エラー");

  alert("保存しました！");
  location.href = `/petal/@${localStorage.getItem("username")}`;
}

/* -------------------------------------------
   ブロック画像アップロード
------------------------------------------- */
async function uploadBlockImage(i) {
  const uid = Number(localStorage.getItem("user_id"));
  const file = document.getElementById(`block_file_${i}`).files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("user_id", uid);
  fd.append("block_index", i);

  const res = await fetch("/api/upload_block_image", { method: "POST", body: fd });
  const json = await res.json();

  if (!json.ok) return alert("アップロード失敗");

  blocks[i].img = json.url;

  document.getElementById(`block_preview_${i}`).src = json.url;
  document.getElementById(`block_preview_${i}`).style.display = "block";
  document.getElementById(`block_img_${i}`).value = json.url;

  alert("ブロック画像を更新しました！");
}
