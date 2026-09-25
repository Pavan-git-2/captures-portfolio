document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;
    const msg = document.getElementById("login-msg");
    const btn = document.getElementById("login-submit");

    btn.disabled = true;
    msg.textContent = "";

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      msg.textContent = "Incorrect email or password.";
      msg.className = "form-msg error";
      btn.disabled = false;
    } else {
      window.location.href = "dashboard.html";
    }
  });
});
