// ↓↓↓ ログインユーザー = 作者ID を localStorage から取得
const userId = localStorage.getItem("user_id");
if (!userId) {
  alert("ログインが必要です。");
  location.href = "/card/login/";
}

loadPending();

async function loadPending() {
  const wrap = document.getElementById("pending-list");

  wrap.innerHTML = `<p class="loading">読み込み中...</p>`;

  const res = await fetch(`https://ojapp.app/card/api/petal/list_pending?owner_id=${userId}`);
  const data = await res.json();

  if (!data.ok) {
    wrap.innerHTML = `<p>読み込みに失敗しました。</p>`;
    return;
  }

  if (data.items.length === 0) {
    wrap.innerHTML = `<p>承認待ちはありません。</p>`;
    return;
  }

  wrap.innerHTML = "";

  data.items.forEach(item => {
    const div = document.createElement("div");
    div.className = "petal-item";

    div.innerHTML = `
      <div class="petal-user">💐 ${item.author_name}</div>
      <div class="petal-message">「${item.message}」</div>
      <div class="buttons">
        <button class="approve-btn">承認</button>
        <button class="delete-btn">削除</button>
      </div>
    `;

    // --- 承認ボタン ---
    div.querySelector(".approve-btn").onclick = async () => {
      await fetch("https://ojapp.app/card/api/petal/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petal_id: item.id })
      });
      loadPending();
    };

    // --- 削除ボタン ---
    div.querySelector(".delete-btn").onclick = async () => {
      await fetch("https://ojapp.app/card/api/petal/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petal_id: item.id })
      });
      loadPending();
    };

    wrap.appendChild(div);
  });
}
