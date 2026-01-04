/* ========================================
   1. カウンタ・ゲーム数
======================================== */
let grape = 0;
let big = 0;
let reg = 0;

let totalGames = 0;
let prevGames = 0;

/* ========================================
   2. タップ(+1)
======================================== */
function tapGrape() { grape++; }
function tapBig()   { big++; }
function tapReg()   { reg++; }
function bindTap(selector, handler) {
  const el = document.querySelector(selector);

  let touched = false;

  // スマホ用（最優先）
  el.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touched = true;
    handler();
  }, { passive: false });

  // PC用（タッチでは発火しない）
  el.addEventListener("click", () => {
    if (!touched) handler();
    touched = false; // 次のタップに備える
  });
}



bindTap(".grape", tapGrape);
bindTap(".big", tapBig);
bindTap(".reg", tapReg);
bindTap(".input-btn", openInputModal);
bindTap(".judge-btn", openJudgeModal);

/* ========================================
   3. 入力モーダル
======================================== */
function openInputModal() {
  document.getElementById("inputModal").classList.add("show");
}

function closeInputModal() {
  totalGames = parseInt(document.getElementById("gamesInput").value || 0);
  prevGames  = parseInt(document.getElementById("gamesPrev").value || 0);
  document.getElementById("inputModal").classList.remove("show");
}


/* ========================================
   4. 設定推測モーダルを開く
======================================== */
function openJudgeModal() {
  document.getElementById("judgeModal").classList.add("show");
  showJudgeResult();
}

function closeJudgeModal() {
  document.getElementById("judgeModal").classList.remove("show");
}

/* ========================================
   5. 本家 Kachi+ と同じ “実測確率”
======================================== */
function getActualRate(count, games) {
  if (count === 0 || games === 0) return 999999; 
  return games / count;
}

/* ========================================
   6. 本家と同じ “ズレ → 信頼度”
======================================== */
function trustWeight(actual, theory) {
  if (actual === 999999) return 0.01;
  const diffRate = Math.abs(actual - theory) / theory;
  return 1 / (diffRate + 0.001);
}

/* ========================================
   7. 設定推測（最高設定のみ返す）
======================================== */
function calcBestSetting() {
  const games = totalGames;
  if (games === 0) return { best: null, percent: 0 };

  const bigC = big;
  const regC = reg;
  const grapeC = grape;

  let scores = {};

  for (let s = 1; s <= 6; s++) {
    const theoBig   = settingValues.big[s];
    const theoReg   = settingValues.reg[s];
    const theoGrape = settingValues.grape[s];

    const actBig   = getActualRate(bigC, games);
    const actReg   = getActualRate(regC, games);
    const actGrape = getActualRate(grapeC, games);

    const wBig   = trustWeight(actBig, theoBig);
    const wReg   = trustWeight(actReg, theoReg);
    const wGrape = trustWeight(actGrape, theoGrape);

    scores[s] = wBig * wReg * wGrape;
  }

  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);

  let best = 1;
  let bestVal = 0;

  for (let s = 1; s <= 6; s++) {
    const p = (scores[s] / totalScore) * 100;
    if (p > bestVal) {
      best = s;
      bestVal = p;
    }
  }

  return { best, percent: bestVal };
}

/* ========================================
   8. 出力（モーダル内容を更新）
======================================== */
function showJudgeResult() {

  // ★ 本家ロジックで最高設定取得
  const r = calcBestSetting();

  const gGames = Math.max(0, totalGames - prevGames);
  const totalBonus = big + reg;

  //const totalRate = totalBonus === 0 ? "1/0" : "1/" + (totalGames / totalBonus).toFixed(2);
  const grapeRate = grape === 0 ? "1/0" : "1/" + (gGames / grape).toFixed(2);

  // ★ ステルス仕様：最高設定だけ表示
  document.getElementById("judgeResult").innerHTML = `
    <div class="judgeBox">
      <div class="judgeMain">推測設定${r.best} : ${r.percent.toFixed(1)}%</div>
      <div class="judgeSub">
        BIG：${big} / REG：${reg}<br>
        🍇：${grape} [${grapeRate}]
      </div>
    </div>
  `;
}
