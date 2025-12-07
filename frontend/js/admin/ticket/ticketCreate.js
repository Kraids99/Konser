import { API } from "../../index.js";

const form = document.getElementById("ticketForm");
const statusEl = document.getElementById("formStatus");
const backBtn = document.getElementById("backBtn");
const selectEvent = document.getElementById("event_id");

async function loadEvents() {
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
    console.error(err);
    selectEvent.innerHTML = '<option value="">Error memuat event</option>';
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  statusEl.textContent = "Menyimpan ticket...";
  statusEl.className = "status";

  const formData = new FormData(form);

  try {
    const res = await fetch(API.TICKET_CREATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      statusEl.textContent = "Berhasil menambah ticket. Mengalihkan...";
      statusEl.className = "status success";
      setTimeout(() => {
        window.location.href = "./ticket.html";
      }, 700);
    } else {
      statusEl.textContent =
        "Gagal: " + (data.message || "Terjadi kesalahan.");
      statusEl.className = "status error";
    }
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    statusEl.className = "status error";
  }
}

function goBack() {
  window.location.href = "./ticket.html";
}

form.addEventListener("submit", handleSubmit);
backBtn.addEventListener("click", goBack);
loadEvents();
