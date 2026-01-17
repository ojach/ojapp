async function runVerify() {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const msg = document.getElementById("message");
  const loginLink = document.getElementById("login-link");

  if (!token) {
    msg.textContent = "トークンがありません。リンクが無効です。";
    return;
  }

  try {
    const res = await fetch(`https://ojapp.app/card/api/verify_email?token=${token}`);
    const data = await res.json();

    if (data.status === "verified") {
      msg.textContent = "メール認証が完了しました。ログインできます。";
      loginLink.style.display = "inline-block";
    }
    else {
      msg.textContent = data.error || "トークンが無効です。再度メールを確認してください。";
    }

  } catch (err) {
    msg.textContent = "通信エラーが発生しました。";
  }
}

runVerify();
