document.getElementById("login-btn").addEventListener("click", login);

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorText = document.getElementById("error-text");

  errorText.textContent = "";

  if (!email || !password) {
    errorText.textContent = "メールアドレスとパスワードを入力してください。";
    return;
  }

  try {
    const res = await fetch("https://ojapp.app/card/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("login response:", data);

    if (data.status !== "ok") {
      errorText.textContent = data.error || "ログインに失敗しました。";
      return;
    }

    // 保存
    localStorage.setItem("ojcard_token", data.token);
    localStorage.setItem("ojcard_username", data.username);

    // 遷移
    location.href = "/card/settings/";

  } catch (err) {
    console.error(err);
    errorText.textContent = "通信エラーが発生しました。";
  }
}
