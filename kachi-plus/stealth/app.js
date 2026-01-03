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

function showJudgeResult() {
  const gGames = grapeGames();

  const rGrape = rate(grape, gGames);
  const rBig   = rate(big, totalGames);
  const rReg   = rate(reg, totalGames);

  document.getElementById("judgeResult").innerHTML = `
    🍇 ぶどう：1/${rGrape.toFixed(2)}<br>
    🔶 BIG：1/${rBig.toFixed(2)}<br>
    🟣 REG：1/${rReg.toFixed(2)}<br><br>
    （※ ステルス版は簡易表示）
  `;
}
