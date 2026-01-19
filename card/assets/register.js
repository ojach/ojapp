document.getElementById("register-btn").addEventListener("click", register);

async function register() {
  const email = document.getElementById("email").value.trim();
  const pw = document.getElementById("password").value.trim();
  const pw2 = document.getElementById("password2").value.trim();
  const errorText = document.getElementById("error-text");

  errorText.textContent = "";

  if (!email || !pw || !pw2) {
    errorText.textContent = "全ての項目を入力してください。";
    return;
  }

  if (pw !== pw2) {
    errorText.textContent = "パスワードが一致しません。";
    return;
  }

  if (pw.length < 6) {
    errorText.textContent = "パスワードは6文字以上必要です。";
    return;
  }

  try {
   const res = await fetch("https://ojcard-worker.trc-wasps.workers.dev/api/create_user", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: pw }),
});


    const data = await res.json();
    console.log("response:", data);

    if (!data.ok) {
      errorText.textContent = data.error || "登録に失敗しました。";
      return;
    }

    // 成功 → 認証案内ページへ
    location.href = "/card/register/success/";

  } catch (err) {
    console.error(err);
    errorText.textContent = "通信エラーが発生しました。";
  }
}
