// --------------------------------------
// 初期化：ログインユーザー名取得
// --------------------------------------
const token = localStorage.getItem("ojcard_token");
if (!token) {
  alert("ログインが必要です。");
  location.href = "/card/login/";
}

let username = localStorage.getItem("ojcard_username");

// プレビューリンクセット
document.getElementById("preview-link").href =
  `https://ojapp.app/card/view/?u=${username}`;


// --------------------------------------
// 名刺データ読み込み
// --------------------------------------
async function loadCard() {
  const res = await fetch(`https://ojapp.app/card/api/get_card/${username}`);
  const data = await res.json();

  if (!data.card) {
    alert("カードがありません。");
    return;
  }

  const c = data.card;

  // フォームに反映
  document.getElementById("name").value = c.name || "";
  document.getElementById("name_roman").value = c.name_roman || "";
  document.getElementById("title").value = c.title || "";

  document.getElementById("icon_url").value = c.icon_url || "";
  document.getElementById("show_icon").checked = !!c.show_icon;

  document.getElementById("company_name").value = c.company_name || "";
  document.getElementById("company_logo_url").value = c.company_logo_url || "";
  document.getElementById("show_company").checked = !!c.show_company;

  document.getElementById("personal_page_url").value = c.personal_page_url || "";
  document.getElementById("sns_link").value = c.sns_link || "";

  // タイプ
  document.querySelector(`input[name="type"][value="${c.type}"]`).checked = true;
}

loadCard();


// --------------------------------------
// 保存処理
// --------------------------------------
document.getElementById("save-btn").addEventListener("click", async () => {

  const body = {
    name: document.getElementById("name").value,
    name_roman: document.getElementById("name_roman").value,
    title: document.getElementById("title").value,

    icon_url: document.getElementById("icon_url").value,
    show_icon: document.getElementById("show_icon").checked,

    company_name: document.getElementById("company_name").value,
    company_logo_url: document.getElementById("company_logo_url").value,
    show_company: document.getElementById("show_company").checked,

    personal_page_url: document.getElementById("personal_page_url").value,
    sns_link: document.getElementById("sns_link").value,

    type: document.querySelector('input[name="type"]:checked').value
  };

  const res = await fetch("https://ojapp.app/card/api/update_card", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (data.status === "ok") {
    alert("保存しました！");
  } else {
    alert("エラー: " + data.error);
  }
});
