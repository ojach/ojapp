// ----------------------------------------
// URL から username を取得
// ----------------------------------------
const params = new URLSearchParams(location.search);
const username = params.get("u");

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
