import { API } from "./index.js";

// elemen form login
let loginForm;
let msgBox;
let quickLinks = [];

function setMsg(text, color = "black") {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.style.color = color;
}

function redirectByRole(role) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "admin") {
    window.location.href = "./admin/event/event.html";
    return;
  }
  window.location.href = "./customerDashboard.html";
}

async function handleLogin(e) {
  // kirim kredensial ke API
  e.preventDefault();
  if (!loginForm) return;

  const data = new FormData();
  data.append("email", loginForm.email.value.trim());
  data.append("password", loginForm.password.value);
  if (loginForm.remember?.checked) {
    data.append("remember", "1");
  }

  setMsg("Memproses...", "blue");

  try {
    const res = await fetch(API.LOGIN, {
      method: "POST",
      body: data,
      credentials: "include",
    });
    const result = await res.json();

    if (res.ok && result.status === "success") {
      setMsg("Login berhasil!", "green");
      redirectByRole(result.data?.role);
      return;
    }

    setMsg("Login gagal: " + (result.message || "unknown error"), "red");
  } catch (err) {
    setMsg("Request gagal: " + err.message, "red");
  }
}

function initLoginPage() {
  // cache elemen dan binding event
  loginForm = document.getElementById("loginForm");
  msgBox = document.getElementById("msg");
  quickLinks = [document.getElementById("addButtonUser")].filter(Boolean);

  quickLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "./frontend/index.html";
    });
  });

  if (!loginForm) return;
  loginForm.addEventListener("submit", handleLogin);
}

document.addEventListener("DOMContentLoaded", initLoginPage);
