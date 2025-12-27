// ========================================
// OJ-Password ReBuilder v1.1
// ========================================

// UI参照
const masterInput = document.getElementById("masterKey");
const monthInput  = document.getElementById("month");
const countSelect = document.getElementById("count");
const placeWrap   = document.getElementById("placeWrap");
const generateBtn = document.getElementById("generateBtn");
const resultArea  = document.getElementById("resultArea");
const resultList  = document.getElementById("resultList");

// ========================================
// 用途入力欄を作成
// ========================================
function updatePlaceInputs() {
  placeWrap.innerHTML = "";

  const count = parseInt(countSelect.value, 10);

  for (let i = 1; i <= count; i++) {
    const div = document.createElement("div");
    div.className = "section";

    div.innerHTML = `
      <div class="section-title">どこで使う？（${i} 個目）</div>
      <input type="text" class="placeInput" placeholder="例：Google / Slack / PC">
    `;
    placeWrap.appendChild(div);
  }
}

// 初期生成
updatePlaceInputs();
countSelect.addEventListener("change", updatePlaceInputs);

// ========================================
// SHA256（ブラウザネイティブ）
// ========================================
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ========================================
// パスワード生成（async化）
// ========================================
async function buildPassword(masterKey, service, month, length, allowSymbol) {
  const base = masterKey + "|" + service + "|" + month;

  // SHA256（非同期）を await する
  const hash = await sha256(base);

  // 記号のON/OFF
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (allowSymbol) chars += "._-";

  let result = "";
  for (let i = 0; i < length; i++) {
    const hex = hash.slice(i * 2, i * 2 + 2);
    const idx = parseInt(hex, 16) % chars.length;
    result += chars[idx];
  }
  return result;
}


// ========================================
// 生成
// ========================================
generateBtn.addEventListener("click", async () => {
  const master = masterInput.value.trim();
  const month  = monthInput.value.trim();
  const count  = parseInt(countSelect.value, 10);

  if (!master) return alert("❌ マスターキーを入力してね！");
  if (!/^\d{6}$/.test(month)) return alert("❌ 作成月は 202512 のように6桁で！");

  const placeInputs = [...document.getElementsByClassName("placeInput")];
  if (placeInputs.some(i => !i.value.trim())) {
    return alert("❌ 『どこで使う？』を全部入力してね！");
  }

  const length = parseInt(document.getElementById("pwLength").value);
  const allowSymbol = document.getElementById("useSymbol").checked;

  let html = "";

 for (let i = 0; i < count; i++) {
  const place = placeInputs[i].value.trim();

  // ← ここ！buildPassword は async だから await 必須
  const pass = await buildPassword(master, place, month, length, allowSymbol);

  html += `
    <div class="result-item" style="margin-bottom: 22px;">
      <strong>[${i + 1} 個目：${place}]</strong><br>
      <code>${pass}</code>
    </div>
  `;
}


  resultList.innerHTML = html;
  resultArea.style.display = "block";

  masterInput.value = ""; // セキュリティのためクリア
});

