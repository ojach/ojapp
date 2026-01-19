// ----------------------------------------
// URL から username を取得
// ----------------------------------------
const params = new URLSearchParams(location.search);
const username = new URLSearchParams(location.search).get("u");
loadPetals(username);

if (!username) {
  alert("ユーザーが指定されていません。?u=username が必要です。");
  throw new Error("username missing");
}

// ----------------------------------------
// 個人ページデータ取得
// ----------------------------------------
async function loadProfile() {
  try {
    const res = await fetch(`https://ojapp.app/card/api/get_profile/${username}`);
    const data = await res.json();

    if (!data.ok || !data.profile) {
      alert("ページが存在しません。");
      return;
    }

    renderProfile(data.profile);

  } catch (err) {
    console.error(err);
    alert("読み込みエラーが発生しました。");
  }
}

loadProfile();

// ----------------------------------------
// 描画処理
// ----------------------------------------
function renderProfile(p) {

  // 非公開のとき
  if (p.page_public !== 1) {
    document.body.innerHTML = `
      <div style="padding:40px; text-align:center; font-size:18px;">
        このページは非公開です。
      </div>
    `;
    return;
  }

  // 表示名
  document.getElementById("display-name").textContent = p.display_name || p.username;

  // @ユーザー名
  document.getElementById("username-tag").textContent = "@" + p.username;

  // アイコン ON/OFF
  if (p.icon_url) {
    document.getElementById("icon-img").src = p.icon_url;
    document.getElementById("icon-wrap").classList.remove("hidden");
  }

  // bio
  document.getElementById("bio").textContent = p.bio || "";

  // Petal を許可している？
  if (p.petal_enabled === 1) {
    document.getElementById("petal-btn").classList.remove("hidden");
  }
}
async function loadPetals(username) {
  const res = await fetch(`https://ojapp.app/card/api/petal/list/${username}`);
  const data = await res.json();

  if (!data.ok) return;

  const wrap = document.getElementById("petal-list");
  wrap.innerHTML = "";

  data.petals.forEach(p => {
    const div = document.createElement("div");
    div.className = "petal-item";
    div.innerHTML = `
      <div class="petal-entry">
        💐 <strong>${p.user}</strong><br>
        「${p.message}」
      </div>
    `;
    wrap.appendChild(div);
  });
}
// ------------------------------------------------------
// 🌸 Petal Modal Open/Close
// ------------------------------------------------------
const modal = document.getElementById("petal-modal");
document.getElementById("open-petal-btn").onclick = () => {
  modal.classList.remove("hidden");
};
document.getElementById("close-petal-btn").onclick =
document.getElementById("petal-close-bg").onclick = () => {
  modal.classList.add("hidden");
};


// ------------------------------------------------------
// 🌸 Petal Message 送信
// ------------------------------------------------------
document.getElementById("send-petal-btn").addEventListener("click", async () => {
  const message = document.getElementById("petal-message").value.trim();
  const err = document.getElementById("petal-error");

  err.textContent = "";

  if (!message) {
    err.textContent = "メッセージを入力してください。";
    return;
  }

  const res = await fetch("/card/api/petal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page_id: PAGE_ID,   // ← 個人ページ側で埋める
      message
    })
  });

  const data = await res.json();

  if (!data.ok) {
    err.textContent = data.error || "送信に失敗しました。";
    return;
  }

  modal.classList.add("hidden");

  // 🌸 Toast表示
  const toast = document.getElementById("petal-toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
});
