async function loadPending() {
  const res = await fetch("/api/petal/pending");
  const json = await res.json();
  if (!json.ok) return alert("読み込み失敗");

  const list = document.getElementById("pending_list");
  list.innerHTML = "";

  json.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "pending-item";

    div.innerHTML = `
      <div class="message-text">${escapeHTML(msg.text)}</div>

      <div class="btn-row">
        <button class="btn btn-approve" onclick="approve(${msg.id})">承認</button>
        <button class="btn btn-deny" onclick="deny(${msg.id})">拒否</button>
        <button class="btn btn-silent" onclick="silentBlock(${msg.from_user_id}, ${msg.id})">この人をサイレント</button>
      </div>
    `;

    list.appendChild(div);
  });
}

async function approve(id) {
  await fetch("/api/petal/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id: id })
  });
  loadPending();
}

async function deny(id) {
  await fetch("/api/petal/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id: id })
  });
  loadPending();
}

async function silentBlock(fromUserId, msgId) {
  const ownerId = Number(localStorage.getItem("user_id"));

  await fetch("/api/petal/silent_block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_id: ownerId,
      blocked_user_id: fromUserId
    })
  });

  // ブロックした時はメッセージ自体も削除する
  await deny(msgId);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

loadPending();
