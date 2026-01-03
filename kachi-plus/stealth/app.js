// ========================================
// 1. 機種設定マスタ（JSON マスタ）
// ========================================
const machineData = {
  im_juggler: {
    name: "アイムジャグラーEX",
    roles: {
      big:   {1:273, 2:270, 3:269, 4:268, 5:266, 6:255},
      reg:   {1:439, 2:399, 3:331, 4:315, 5:255, 6:255},
      grape: {1:6.02,2:6.02,3:6.02,4:5.78,5:5.78,6:5.66}
    }
  },

  neo_im_juggler: {
    name: "ネオアイムジャグラーEX",
    roles: {
      big:   {1:273.1,2:269.7,3:269.7,4:259,5:259,6:255},
      reg:   {1:439.8,2:399.6,3:331,4:315.1,5:255,6:255},
      grape: {1:6.02,2:6.02,3:6.02,4:5.78,5:5.78,6:5.66}
    }
  },

  funky2: {
    name: "ファンキージャグラー2",
    roles: {
      big:   {1:266.4,2:259.0,3:256.0,4:249.2,5:240.1,6:219.9},
      reg:   {1:439.8,2:407.1,3:366.1,4:322.8,5:299.3,6:262.1},
      grape: {1:5.93,2:5.89,3:5.82,4:5.81,5:5.76,6:5.68}
    }
  },

  myj5: {
    name: "マイジャグラーV",
    roles: {
      big:   {1:272.2,2:270.8,3:266.4,4:259.0,5:255.0,6:255.0},
      reg:   {1:439.8,2:399.6,3:331.0,4:315.1,5:255.0,6:255.0},
      grape: {1:6.03,2:6.03,3:6.00,4:5.94,5:5.90,6:5.85}
    }
  },

  happyv3: {
    name: "ハッピージャグラーVⅢ",
    roles: {
      big:   {1:282.5,2:275.4,3:268.6,4:259.0,5:249.2,6:240.1},
      reg:   {1:431.2,2:390.0,3:336.0,4:315.1,5:292.6,6:273.1},
      grape: {1:6.32,2:6.29,3:6.25,4:6.16,5:6.10,6:6.05}
    }
  },

  gogo3: {
    name: "ゴーゴージャグラー3",
    roles: {
      big:   {1:282.5,2:275.4,3:268.6,4:259.0,5:249.2,6:240.1},
      reg:   {1:431.2,2:390.0,3:336.0,4:315.1,5:292.6,6:273.1},
      grape: {1:6.30,2:6.26,3:6.20,4:6.15,5:6.10,6:6.05}
    }
  },

  girlss: {
    name: "ジャグラーガールズSS",
    roles: {
      big:   {1:273.1,2:270.8,3:269.7,4:259.0,5:255.0,6:255.0},
      reg:   {1:431.2,2:390.0,3:336.0,4:315.1,5:255.0,6:255.0},
      grape: {1:6.10,2:6.05,3:6.00,4:5.95,5:5.90,6:5.85}
    }
  },

  mrj: {
    name: "ミスタージャグラー",
    roles: {
      big:   {1:268.6,2:259.0,3:249.2,4:240.1,5:234.0,6:225.0},
      reg:   {1:431.2,2:390.0,3:336.0,4:315.1,5:292.6,6:273.1},
      grape: {1:6.15,2:6.09,3:6.02,4:5.97,5:5.88,6:5.79}
    }
  },

  umj: {
    name: "ウルトラミラクルジャグラー",
    roles: {
      big:   {1:292.6,2:282.5,3:268.6,4:259.0,5:249.2,6:240.1},
      reg:   {1:431.2,2:390.0,3:336.0,4:315.1,5:292.6,6:273.1},
      grape: {1:6.35,2:6.30,3:6.25,4:6.20,5:6.10,6:6.00}
    }
  }
};

// ========================================
// 2. URLパラメータから機種IDを取得
// ========================================
const id = "funky2";
const machine = machineData[id];

// 機種名の表示
if (machine) {
  document.getElementById("machineName").innerText = machine.name;
} else {
  document.getElementById("machineName").innerText = "機種が見つかりません";
}

// この機種の設定値
let settingValues = machine.roles;
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
  if (count === 0 || games === 0) return "1/0";
  return "1/" + (games / count).toFixed(2);
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
  /* ================================
    ステルス用：最高設定だけ返す
================================ */

// 実測確率（count=回数、games=総回転数）
function getActualRate(count, games) {
  if (count === 0 || games === 0) return 999999; // 無限大の代わり
  return games / count;
}

// ズレ率 → 信頼度変換
function trustWeight(actual, theory) {
  if (actual === 999999) return 0.01;  // データなしは最弱

  const diffRate = Math.abs(actual - theory) / theory; // 比率差
  return 1 / (diffRate + 0.001); // 差が小さいほど大きい
}


function updateSettingAnalysis() {
  const top = document.getElementById("resultTop");
  const list = document.getElementById("resultList");

  const games = totalGames;
  const bigC = big;
  const regC = reg;
  const grapeC = grape;

  // ゲーム数0は無効
  if (games === 0) {
    top.innerText = "ゲーム数がありません";
    list.innerHTML = "";
    return;
  }

  let scores = {};

  for (let s = 1; s <= 6; s++) {
    const theoBig = settingValues.big[s];
    const theoReg = settingValues.reg[s];
    const theoGrape = settingValues.grape[s];

    const actBig = getActualRate(bigC, games);
    const actReg = getActualRate(regC, games);
    const actGrape = getActualRate(grapeC, games);

    const wBig = trustWeight(actBig, theoBig);
    const wReg = trustWeight(actReg, theoReg);
    const wGrape = trustWeight(actGrape, theoGrape);

    const score = wBig * wReg * wGrape;
    scores[s] = score;
  }

  // 正規化
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  let resultPercent = {};
  for (let s = 1; s <= 6; s++) {
    resultPercent[s] = (scores[s] / total) * 100;
  }

  // 最大設定
  let bestSetting = 1;
  let bestValue = 0;
  for (let s = 1; s <= 6; s++) {
    if (resultPercent[s] > bestValue) {
      bestSetting = s;
      bestValue = resultPercent[s];
    }
  }

  // -----------------------------------------------------

  document.getElementById("judge-modal").innerHTML = `
    <div class="modal-inner">
      <div class="judge-title">推測結果</div>
      <div class="judge-main">設定推測：<span>${bestSetting}</span></div>

      <div class="judge-sub">
        BIG：${big} / REG：${reg}<br>
        合算：1/${totalRate}<br>
        ぶどう：1/${grapeRate}
      </div>
    </div>
  `;

  document.getElementById("judge-bg").classList.add("show");
}

