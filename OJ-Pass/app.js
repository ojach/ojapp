// ========================================
// OJ-Password ReBuilder v1.1（完全版）
// ========================================

// UI
const masterInput = document.getElementById("masterKey");
const monthInput  = document.getElementById("month");
const countSelect = document.getElementById("count");
const placeWrap   = document.getElementById("placeWrap");
const generateBtn = document.getElementById("generateBtn");
const resultArea  = document.getElementById("resultArea");
const resultList  = document.getElementById("resultList");

// ========================================
// 用途入力欄の生成
// ========================================
function updatePlaceInputs() {
  placeWrap.innerHTML = "";

  const count = parseInt(countSelect.value, 10);

  for (let i = 1; i <= count; i++) {
    const div = document.createElement("div");
    div.className = "section";
    div.innerHTML = `
      <div class="section-title">どこで使う？（${i} 個目）</div>
      <input type="text" class="placeInput" placeholder="例：Google / Slack / 社内PC">
    `;
    placeWrap.appendChild(div);
  }
}

updatePlaceInputs();
countSelect.addEventListener("change", updatePlaceInputs);

// ========================================
// SHA256（ネイティブ）
// ========================================
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ========================================
// パスワード生成ロジック
// ========================================
function buildPassword(hashHex, length, allowSymbol) {

  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (allowSymbol) chars += "._-";

  let result = "";

  for (let i = 0; i < length; i++) {
    const hex = hashHex.slice(i * 2, i * 2 + 2);
    const idx = parseInt(hex, 16) % chars.length;
    result += chars[idx];
  }
  return result;
}

// ========================================
// 生成イベント
// ========================================
generateBtn.addEventListener("click", async () => {

  const master = masterInput.value.trim();
  const month  = monthInput.value.trim();
  const count  = parseInt(countSelect.value, 10);

  if (!master) return alert("❌ マスターキーを入力してね！");
  if (!/^\d{6}$/.test(month)) return alert("❌ 作成月は 202512 のように6桁だよ！");

  const placeInputs = [...document.getElementsByClassName("placeInput")];

  // 空欄チェック
  if (placeInputs.some(i => !i.value.trim())) {
    return alert("❌ 『どこで使う？』を全部入力してね！");
  }

  // 追加設定
  const length = parseInt(document.getElementById("pwLength").value, 10);
  const allowSymbol = document.getElementById("useSymbol").checked;

  let html = "";

  for (let i = 0; i < count; i++) {
    const service = placeInputs[i].value.trim();

    // マスターキー + 用途 + 月 でハッシュ生成
    const seed = `${master}|${service}|${month}`;
    const hash = await sha256(seed);

    // パスワード生成
    const pass = buildPassword(hash, length, allowSymbol);

    html += `
      <div class="result-item" style="margin-bottom: 20px;">
        <strong>[${i + 1} 個目：${service}]</strong><br>
        <code>${pass}</code>
      </div>
    `;
  }

  resultList.innerHTML = html;
  resultArea.style.display = "block";

  // マスターキー削除（安全対策）
  masterInput.value = "";
});
