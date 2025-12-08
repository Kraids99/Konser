import { API } from "../../index.js";
import { cekAdmin } from "../adminAuth.js";

// form edit event
let form;
let statusEl;
let backBtn;
let submitBtn;
let locationSelect;
let eventIdInput;

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

function setStatus(text, type = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = type ? `status ${type}` : "status";
}

async function loadLocations() {
  if (!locationSelect) return false;
  try {
    const res = await fetch(API.LOCATIONS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      setStatus("Gagal memuat lokasi.", "error");
      return false;
    }
    const locations = data.data || [];
    locations.forEach((loc) => {
      const opt = document.createElement("option");
      opt.value = loc.location_id;
      opt.textContent = `${loc.city} - ${loc.address}`;
      locationSelect.appendChild(opt);
    });
    return true;
  } catch (err) {
    setStatus("Error memuat lokasi: " + err.message, "error");
    return false;
  }
}

async function loadEventData(id) {
  try {
    const res = await fetch(`${API.EVENT_SHOW}&id=${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      fillForm(data.data);
      setStatus("");
      enableForm();
    } else {
      setStatus("Gagal memuat: " + (data.message || "Terjadi kesalahan."), "error");
    }
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  }
}

function fillForm(ev) {
  if (!form) return;
  form.event_name.value = ev.event_name || "";
  form.location_id.value = ev.location_id || "";

  if (ev.event_date) {
    const date = new Date(ev.event_date);
    const formatted = date.toISOString().split("T")[0];
    form.event_date.value = formatted;
  }

  form.quota.value = ev.quota || "";
}

function enableForm() {
  if (!form) return;
  form.event_name.disabled = false;
  form.location_id.disabled = false;
  form.event_date.disabled = false;
  form.quota.disabled = false;
  if (submitBtn) submitBtn.disabled = false;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;
  setStatus("Menyimpan perubahan...", "loading");

  const formData = new FormData(form);

  try {
    const res = await fetch(API.EVENT_UPDATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      setStatus("Berhasil mengubah event. Mengalihkan...", "success");
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

async function initEventEdit() {
  form = document.getElementById("eventForm");
  statusEl = document.getElementById("formStatus");
  backBtn = document.getElementById("backBtn");
  submitBtn = document.getElementById("submitBtn");
  locationSelect = document.getElementById("location_id");
  eventIdInput = document.getElementById("event_id");

  const isAdmin = await cekAdmin();
  if (!isAdmin) return;

  if (!eventId) {
    alert("ID event tidak ditemukan.");
    goBack();
    return;
  }
  if (eventIdInput) eventIdInput.value = eventId;

  setStatus("Memuat data...", "loading");
  const ok = await loadLocations();
  if (ok) {
    await loadEventData(eventId);
  }

  if (form) form.addEventListener("submit", handleSubmit);
  if (backBtn) backBtn.addEventListener("click", goBack);
}

document.addEventListener("DOMContentLoaded", initEventEdit);
