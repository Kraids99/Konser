import { API } from "./index.js";

// elemen form register
let registerForm;
let msgBox;
let usernameInput;
let emailInput;
let passwordInput;

function setMsg(text, isError = false) {
  if (!msgBox) return;
  msgBox.textContent = text; //ubah text sesuai pesan
  msgBox.style.color = isError ? "#d63b3b" : "#2563eb";//merah error, biru normal
}

async function handleRegister(e) {
  // kirim data pendaftaran
  e.preventDefault();
  if (!registerForm) return;

  const data = new FormData();    //membuat formdata utk mengirim data ke backend
  data.append("username", usernameInput.value.trim()); //input usn
  data.append("email", emailInput.value.trim());      //input email
  data.append("password", passwordInput.value);       //input pass

  setMsg("Mendaftarkan...");//berikan feedback

  try {
    const res = await fetch(API.REGISTER, {//kirim request post ke endpoint register
      method: "POST",
      body: data, // browser otomatis buat boundary
    });
    const result = await res.json();

    if (res.ok) {//jika ok, maka berhasil daftar, kemudian redirect ke login.html
      alert("Pendaftaran berhasil!");
      setMsg("");
      window.location.href = "./login.html";
      return;
    }

    setMsg("Registrasi gagal: " + (result.message || "unknown error"), true);//set message gagal jika gagal
  } catch (err) {
    setMsg("Request gagal: " + err.message, true); //klo fetch gagal, set msg gagal
  }
}

function initRegisterPage() {
  // cache elemen dan binding event
  registerForm = document.getElementById("registerForm"); //ambil form register
  msgBox = document.getElementById("msg");                //elemen pesan
  usernameInput = document.getElementById("username");    //input usn
  emailInput = document.getElementById("email");          //input email
  passwordInput = document.getElementById("password");    //input pass

  if (!registerForm) return;
  registerForm.addEventListener("submit", handleRegister);//klo pencet submit, panggil func handleRegister
}

document.addEventListener("DOMContentLoaded", initRegisterPage);//menyiapkan input dan event handler

