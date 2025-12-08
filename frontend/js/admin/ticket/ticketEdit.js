import { API } from "../../index.js";
import { cekAdmin } from "../adminAuth.js";

// form edit ticket
let form;
let statusEl;
let backBtn;
let submitBtn;
let selectEvent;
let ticketIdInput;

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

function setStatus(text, type = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = type ? `status ${type}` : "status";
}

async function loadEvents() {
  if (!selectEvent) return;
  try {
    const res = await fetch(API.EVENTS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      selectEvent.innerHTML = '<option value="">Gagal memuat event</option>';
      return;
    }
    const list = data.data || [];

    if (list.length === 0) {
      selectEvent.innerHTML = '<option value="">Belum ada event</option>';
      return;
    }

    selectEvent.innerHTML =
      '<option value="">Pilih event</option>' +
      list
        .map((ev) => {
          const eventName = ev.event_name || "Unnamed Event";
          const eventDate = ev.event_date
            ? new Date(ev.event_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";
          return `<option value="${ev.event_id}">${eventName}${
            eventDate ? " - " + eventDate : ""
          }</option>`;
        })
        .join("");
  } catch (err) {
    selectEvent.innerHTML = '<option value="">Error memuat event</option>';
  }
}

async function loadTicket(id) {
  setStatus("Memuat data ticket...", "loading");
  try {
    const res = await fetch(`${API.TICKET_SHOW}&id=${encodeURIComponent(id)}`, {
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

function fillForm(t) {
  if (!form) return;
  form.ticket_type.value = t.ticket_type || "";
  form.price.value = t.price || "";
  selectEvent.value = t.event_id || "";
}

function enableForm() {
  if (!form) return;
  form.event_id.disabled = false;
  form.ticket_type.disabled = false;
  form.price.disabled = false;
  if (submitBtn) submitBtn.disabled = false;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;
  setStatus("Menyimpan perubahan...", "loading");

  const formData = new FormData(form);

  try {
    const res = await fetch(API.TICKET_UPDATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      setStatus("Berhasil mengubah ticket. Mengalihkan...", "success");
      setTimeout(() => {
        window.location.href = "./ticket.html";
      }, 700);
    } else {
      setStatus("Gagal: " + (data.message || "Terjadi kesalahan."), "error");
    }
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  }
}

function goBack() {
  window.location.href = "./ticket.html";
}

async function initTicketEdit() {
  form = document.getElementById("ticketForm");
  statusEl = document.getElementById("formStatus");
  backBtn = document.getElementById("backBtn");
  submitBtn = document.getElementById("submitBtn");
  selectEvent = document.getElementById("event_id");
  ticketIdInput = document.getElementById("ticket_id");

  if (!ticketId) {
    alert("ID ticket tidak ditemukan.");
    goBack();
    return;
  }
  if (ticketIdInput) ticketIdInput.value = ticketId;

  const isAdmin = await cekAdmin();
  if (!isAdmin) return;
  await loadEvents();
  await loadTicket(ticketId);

  if (form) form.addEventListener("submit", handleSubmit);
  if (backBtn) backBtn.addEventListener("click", goBack);
}

document.addEventListener("DOMContentLoaded", initTicketEdit);
