import { API } from "../../index.js";
import { cekAdmin } from "../adminAuth.js";

// form tambah ticket
let form;
let statusEl;
let backBtn;
let selectEvent;

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

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;
  setStatus("Menyimpan ticket...");

  const formData = new FormData(form);

  try {
    const res = await fetch(API.TICKET_CREATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      setStatus("Berhasil menambah ticket. Mengalihkan...", "success");
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

async function initTicketCreate() {
  form = document.getElementById("ticketForm");
  statusEl = document.getElementById("formStatus");
  backBtn = document.getElementById("backBtn");
  selectEvent = document.getElementById("event_id");

  const isAdmin = await cekAdmin();
  if (!isAdmin) return;
  loadEvents();

  if (form) form.addEventListener("submit", handleSubmit);
  if (backBtn) backBtn.addEventListener("click", goBack);
}

document.addEventListener("DOMContentLoaded", initTicketCreate);
