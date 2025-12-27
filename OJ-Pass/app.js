<script>
// ========================================
// OJ-Password ReBuilder v1.0
// 安全・再現性100% のパスワード再構築ツール
// ========================================

// ---- UI参照 ----
const masterInput = document.getElementById("masterKey");
const monthInput  = document.getElementById("createMonth");
const countSelect = document.getElementById("countSelect");
const lengthSelect = document.getElementById("lengthSelect");
const symbolToggle = document.getElementById("symbolToggle");
const placeWrap   = document.getElementById("placeWrap");
const resultArea  = document.getElementById("resultArea");
const generateBtn = document.getElementById("generateBtn");

// ========================================
// 「いくつ作る？」 → 用途入力欄を動的に生成
// ========================================
function updatePlaceInputs() {
  placeWrap.innerHTML = ""; // 一旦リセット

  const count = parseInt(countSelect.value, 10);

  for (let i = 1; i <= count; i++) {
    const div = document.createElement("div");
    div.className = "place-item";

    div.innerHTML = `
      <label>どこで使う？（${i} 個目）</label>
      <input type="text" class="placeInput" placeholder="例：Google / Slack など">
    `;

    placeWrap.appendChild(div);
  }
}

// 初回に生成
updatePlaceInputs();
countSelect.addEventListener("change", updatePlaceInputs);

// ========================================
// SHA-256（ブラウザネイティブ）
// ========================================
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Base64URL
}

// ========================================
// 記号の安全セット
// ========================================
const SAFE_SYMBOLS = "!-_.@#$";

// ========================================
// パスワード生成本体
// ========================================
async function createPassword(seed, length, useSymbol) {
  // seed → sha256 → base64URL
  let base = await sha256(seed);

  // 文字セット（記号OFFなら英数字のみ）
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let symbols = SAFE_SYMBOLS;

  let charset = letters + (useSymbol ? symbols : "");

  // base64URL → charset の範囲に正規化
  let out = "";
  for (let i = 0; i < base.length && out.length < length; i++) {
    const c = base.charCodeAt(i);
    out += charset[c % charset.length];
  }

  return out;
}

// ========================================
// 生成ボタン
// ========================================
generateBtn.addEventListener("click", async () => {

  const master = masterInput.value.trim();
  const month  = monthInput.value.trim();
  const count  = parseInt(countSelect.value, 10);
  const length = parseInt(lengthSelect.value, 10);
  const useSymbol = symbolToggle.checked;

  // 入力チェック
  if (!master) {
    alert("❌ マスターキーを入力してね！");
    return;
  }
  if (!month || !/^\d{6}$/.test(month)) {
    alert("❌ 作成月は 202512 のように 6桁で入力してね！");
    return;
  }

  const placeInputs = [...document.getElementsByClassName("placeInput")];
  if (placeInputs.some(i => !i.value.trim())) {
    alert("❌ 『どこで使う？』を全部入力してね！");
    return;
  }

  // パスワード生成開始
  let html = "<h3>🔑 生成結果</h3>";

  for (let i = 0; i < count; i++) {
    const place = placeInputs[i].value.trim();

    // 再現性100% の seed 作成
    const seed = `${master}:${month}:${place}`;

    const pass = await createPassword(seed, length, useSymbol);

    html += `
      <div class="result-item">
        <strong>[${i + 1} 個目：${place}]</strong><br>
        <code>${pass}</code>
      </div>
    `;
  }

  resultArea.innerHTML = html;

  // マスターキーを消して安全にする
  masterInput.value = "";
});
</script>
