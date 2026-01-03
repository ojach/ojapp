/* =============================
   1. カウンタ変数
============================= */
let grape = 0;
let big = 0;
let reg = 0;

let totalGames = 0;
let prevGames = 0;

/* =============================
   2. 丸タップ (+1)
============================= */
function tapGrape() { grape++; }
function tapBig()   { big++; }
function tapReg()   { reg++; }


/* =============================
   3. 入力モーダル
============================= */
function openInputModal() {
  document.getElementById("inputModal").style.display = "block";
}

function closeInputModal() {
  totalGames = parseInt(document.getElementById("gamesInput").value || 0);
  prevGames  = parseInt(document.getElementById("gamesPrev").value || 0);

  document.getElementById("inputModal").style.display = "none";
}


/* =============================
   4. 設定推測モーダル
============================= */
function openJudgeModal() {
  document.getElementById("judgeModal").style.display = "block";
  showJudgeResult();
}

function closeJudgeModal() {
  document.getElementById("judgeModal").style.display = "none";
}


/* =============================
   5. 設定推測ロジック
============================= */
function rate(count, games) {
  if (count === 0 || games === 0) return Infinity;
  return games / count;
}

// ぶどうは自分が回した分だけ
function grapeGames() {
  const g = totalGames - prevGames;
  return g > 0 ? g : 0;
}

function showJudgeModal() {

  const big = countBig;
  const reg = countReg;
  const grape = countGrape;
  const total = big + reg;

  // 合算（BIGとREGの合計回数）
  const totalRate = total > 0 ? (spins / total).toFixed(1) : "-";

  // ぶどう確率
  const grapeRate = grape > 0 ? (spins / grape).toFixed(1) : "-";

  // ------------ 設定推測ロジック（簡易版）--------------
  const rates = calcSettingExpect(); 
  // 返り値例 → {1:0.1, 2:0.15, 3:0.17, 4:0.25, 5:0.18, 6:0.15}

  // 最有力設定
  const bestSetting = Object.entries(rates)
    .sort((a,b)=>b[1]-a[1])[0][0]; 
  // -----------------------------------------------------

  document.getElementById("judge-modal").innerHTML = `
    <div class="modal-inner">
      <div class="judge-title">推測結果</div>
      <div class="judge-main">最有力設定：<span>${bestSetting}</span></div>

      <div class="judge-sub">
        BIG：${big} / REG：${reg}<br>
        合算：1/${totalRate}<br>
        ぶどう：1/${grapeRate}
      </div>
    </div>
  `;

  document.getElementById("judge-bg").classList.add("show");
}

