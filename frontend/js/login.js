import { API } from "./index.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

const addButtonsUser = [
  document.getElementById("addButtonUser")
].filter(Boolean);

async function login(e) {
  e.preventDefault(); // supaya tidak reload halaman

  // FormData membentuk body multipart, tinggal append field sesuai name input
  const data = new FormData();
  data.append("email", form.email.value.trim());
  data.append("password", form.password.value);
  if (form.remember?.checked) {
    data.append("remember", "1"); // 1 artinya aktifkan remember me
  }

  msg.textContent = "Submitting...";

  try {
    const res = await fetch(API.LOGIN, {
      method: "POST",
      body: data, // jangan set Content-Type; browser yang isi boundary
      credentials: "include", // penting supaya cookie/sesi tersimpan
    });

    const result = await res.json();

    if (res.ok && result.status === "success") {
      msg.textContent = "Login berhasil!";
      const role = (result.data?.role || "").toLowerCase();
      // arahkan sesuai role
      if (role === "admin") {
        window.location.href = "./admin/event/event.html";
      } else {
        window.location.href = "./customerDashboard.html";
      }
    } else {
      msg.textContent = "Login gagal: " + (result.message || "unknown error");
    }
  } catch (err) {
    msg.textContent = "Request gagal: " + err.message;
  }
}

addButtonsUser.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "./frontend/index.html";
  });
});

form.addEventListener("submit", login);
