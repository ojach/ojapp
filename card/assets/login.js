document.getElementById("login-btn").addEventListener("click", login);

async function login() {
  const email = document.getElementById("email").value.trim();
  const pw = document.getElementById("password").value.trim();
  const errorText = document.getElementById("error-text");

  errorText.textContent = "";

  if (!email || !pw) {
    errorText.textContent = "全ての項目を入力してください。";
    return;
  }

  try {
    const res = await fetch("https://ojapp.app/card/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });

    const data = await res.json();
    console.log("login:", data);

    if (!data.ok) {
      errorText.textContent = data.error || "ログインできませんでした。";
      return;
    }

    // ✔ email 未認証なら案内ページへ
    if (data.email_verified === 0) {
      location.href = "/card/verify/required/";
      return;
    }

    // ✔ ログイン成功 → ユーザーデータへ
    localStorage.setItem("user_id", data.user_id);
    location.href = "/card/home/";

  } catch (err) {
    console.error(err);
    errorText.textContent = "通信エラーが発生しました。";
  }
}
