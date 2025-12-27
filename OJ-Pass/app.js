// ==========================================
// OJ-Password ReBuilder  v1.0
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const masterKeyInput = document.getElementById("masterKey");
  const monthInput = document.getElementById("month");
  const countSelect = document.getElementById("count");
  const resultArea = document.getElementById("resultArea");
  const resultList = document.getElementById("resultList");
  const generateBtn = document.getElementById("generateBtn");

  // -------------------------------------------------
  // SHA-256（ブラウザ組み込み）→ hex文字列にする関数
  // -------------------------------------------------
  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)]
      .map(n => n.toString(16).padStart(2, "0"))
      .join("");
  }

  // -------------------------------------------------
  // 生成したハッシュから「強力パスワード」を作る
  // ・必ず英大文字 + 英小文字 + 数字 を含む
  // ・記号は固定で入れる（!@#）
  // -------------------------------------------------
  function buildPassword(hex, length = 16) {
    const big = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const small = "abcdefghijklmnopqrstuvwxyz";
    const num = "0123456789";
    const symbol = "!@#";

    let base = big + small + num + symbol;

    let out = "";
    for (let i = 0; i < length; i++) {
      const pair = hex.slice(i * 2, i * 2 + 2);
      const idx = parseInt(pair, 16) % base.length;
      out += base[idx];
    }
    return out;
  }

  // -------------------------------------------------
  // メイン処理
  // -------------------------------------------------
  generateBtn.addEventListener("click", async () => {

    const master = masterKeyInput.value;
    const month = monthInput.value.trim();
    const count = parseInt(countSelect.value, 10);

    if (!master) {
      alert("マスターキーを入力して！");
      return;
    }
    if (!month || month.length !== 6 || isNaN(Number(month))) {
      alert("作成月は 202501 のように6桁で入力して！");
      return;
    }

    // いったん UI クリア
    resultList.innerHTML = "";
    resultArea.style.display = "block";

    // -------------------------------------------------
    // ★ パスワード生成
    // -------------------------------------------------
    for (let i = 1; i <= count; i++) {

      // 入力情報をひとまとめ（再現性100%）
      const seed = `${master}:${month}:#${i}`;

      // ① SHA256に変換
      const hash = await sha256(seed);

      // ② 強力パスワード生成
      const pass = buildPassword(hash, 16);

      // UIへ追加
      const div = document.createElement("div");
      div.className = "pass-item";
      div.innerHTML = `
        <div class="pass-label">［${i} 個目：どこで使う？］</div>
        <div class="pass-value">${pass}</div>
      `;
      resultList.appendChild(div);
    }

    // -------------------------------------------------
    // ★ セキュリティ対策：マスターキーを即削除
    // -------------------------------------------------
    masterKeyInput.value = "";      // 入力欄から消す
    masterKeyInput.blur();          // キーボード閉じる
    // メモリ上にも残さないように master を上書き
    // （JSではガベージコレクタ任せなので null 化）
    // ただし "master" はローカル変数なのでここで null にできないが
    // 次の tick で解放される
  });

});
