// ------------------------------------------
// 1. URL から username を取得
// ------------------------------------------
const params = new URLSearchParams(location.search);
const username = params.get("u");

if (!username) {
  alert("ユーザーが指定されていません。?u=username が必要です。");
  throw new Error("No username");
}

// ------------------------------------------
// 2. API から名刺データ取得
// ------------------------------------------
async function loadCard() {
  try {
    const res = await fetch(`https://ojapp.app/card/api/get_card/${username}`);
    const data = await res.json();

    if (!data.card) {
      alert("カードが存在しません。");
      return;
    }

    const card = data.card;

    renderCard(card);

  } catch (err) {
    console.error(err);
    alert("読み込み中にエラーが発生しました。");
  }
}

loadCard();

// ------------------------------------------
// 3. 名刺描画処理
// ------------------------------------------
function renderCard(card) {

  const container = document.querySelector(".card-container");

  // --- テーマ設定（business / casual） ---
  container.classList.add(card.type);

  // --- メイン情報 ---
  document.getElementById("name").textContent = card.name;
  document.getElementById("name-roman").textContent = card.name_roman;
  document.getElementById("title").textContent = card.title;

  // --- アイコン ON/OFF ---
  const iconBlock = document.getElementById("icon-block");
  if (card.show_icon && card.icon_url) {
    document.getElementById("icon-img").src = card.icon_url;
    iconBlock.classList.remove("hidden");
  } else {
    iconBlock.classList.add("hidden");
  }

  // --- 会社ブロック ON/OFF ---
  const companyBlock = document.getElementById("company-block");
  if (card.show_company && card.company_name) {
    if (card.company_logo_url) {
      document.getElementById("company-logo").src = card.company_logo_url;
    }
    document.getElementById("company-name").textContent = card.company_name;
    companyBlock.classList.remove("hidden");
  } else {
    companyBlock.classList.add("hidden");
  }

  // --- 下段リンク：個人ページ ---
  const linkWrap = document.getElementById("link-wrapper");
  linkWrap.href = card.personal_page_url || "#";

  // businessのとき → “Link”
  // casualのとき → アイコンそのまま
  document.getElementById("link-text").textContent =
    card.type === "business" ? "Link" : "🔗";

  // --- 下段リンク：SNS ---
  const snsWrap = document.getElementById("sns-wrapper");
  snsWrap.href = card.sns_link || "#";

  document.getElementById("sns-text").textContent =
    card.type === "business" ? "SNS" : "SNS";

  // casual のときは SVG の色が CSS で変わる
}
