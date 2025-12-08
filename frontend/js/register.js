import { API } from "./index.js";

// elemen form register
let registerForm;
let msgBox;
let usernameInput;
let emailInput;
let passwordInput;

function setMsg(text, isError = false) {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.style.color = isError ? "#d63b3b" : "#2563eb";
}

async function handleRegister(e) {
  // kirim data pendaftaran
  e.preventDefault();
  if (!registerForm) return;

  const data = new FormData();
  data.append("username", usernameInput.value.trim());
  data.append("email", emailInput.value.trim());
  data.append("password", passwordInput.value);

  setMsg("Mendaftarkan...");

  try {
    const res = await fetch(API.REGISTER, {
      method: "POST",
      body: data, // browser otomatis buat boundary
    });

    // Safeguard: kalau backend balikin HTML/404, jangan pecah di JSON.parse
    const raw = await res.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Respons bukan JSON (status ${res.status}). Periksa URL API: ${API.REGISTER}`
      );
    }

    if (res.ok) {
      alert("Pendaftaran berhasil!");
      setMsg("");
      window.location.href = "./login.html";
      return;
    }

    setMsg("Registrasi gagal: " + (result.message || "unknown error"), true);
  } catch (err) {
    setMsg("Request gagal: " + err.message, true);
  }
}

function initRegisterPage() {
  // cache elemen dan binding event
  registerForm = document.getElementById("registerForm");
  msgBox = document.getElementById("msg");
  usernameInput = document.getElementById("username");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");

  if (!registerForm) return;
  registerForm.addEventListener("submit", handleRegister);
}

document.addEventListener("DOMContentLoaded", initRegisterPage);

