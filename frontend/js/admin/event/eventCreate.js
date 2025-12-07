import { API } from "../../index.js";

// form tambah event
let form;
let statusEl;
let backBtn;
let locationSelect;

function setStatus(text, type = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = type ? `status ${type}` : "status";
}

async function loadLocations() {
  if (!locationSelect) return;
  try {
    const res = await fetch(API.LOCATIONS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      setStatus("Gagal memuat daftar lokasi.", "error");
      return;
    }
    const locations = data.data || [];
    locations.forEach((loc) => {
      const opt = document.createElement("option");
      opt.value = loc.location_id;
      opt.textContent = `${loc.city} - ${loc.address}`;
      locationSelect.appendChild(opt);
    });
  } catch (err) {
    setStatus("Error memuat lokasi: " + err.message, "error");
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;
  setStatus("Menyimpan event...");

  const formData = new FormData(form);

  try {
    const res = await fetch(API.EVENT_CREATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      setStatus("Berhasil menambah event. Mengalihkan...", "success");
      setTimeout(() => {
        window.location.href = "./event.html";
      }, 700);
    } else {
      setStatus("Gagal: " + (data.message || "Terjadi kesalahan."), "error");
    }
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  }
}

function goBack() {
  window.location.href = "./event.html";
}

function initEventCreate() {
  form = document.getElementById("eventForm");
  statusEl = document.getElementById("formStatus");
  backBtn = document.getElementById("backBtn");
  locationSelect = document.getElementById("location_id");

  loadLocations();

  if (form) form.addEventListener("submit", handleSubmit);
  if (backBtn) backBtn.addEventListener("click", goBack);
}

document.addEventListener("DOMContentLoaded", initEventCreate);
