import { API } from "../../index.js";

let eventsListEl; // event list (kartu)
let searchInput;
let addButton;
let rawEvents = []; // data event dari API (disimpan supaya bisa difilter)
let locationMap = {}; // object peta location_id

// ambil elemen DOM
function cacheDom() {
  eventsListEl = document.getElementById("eventsList"); // container kartu event
  searchInput = document.getElementById("searchInput"); // input pencarian
  addButton = document.getElementById("addEventBtn2"); // button add
}

// fetch lokasi dan simpan ke locationMap
async function fetchLocations() {
  try {
    // panggil API lokasi (pakai cookie/session)
    const res = await fetch(API.LOCATIONS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") return;
    (data.data || []).forEach((loc) => {
      locationMap[loc.location_id] = loc;
    });
  } catch {
    // abaikan error lokasi
  }
}

// fetch daftar event
async function fetchEvents() {
  if (!eventsListEl) return;
  try {
    if (!Object.keys(locationMap).length) {
      await fetchLocations();
    }
    const res = await fetch(API.EVENTS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      eventsListEl.innerHTML = `<div class="empty">Gagal memuat event.</div>`;
      return;
    }
    rawEvents = data.data || [];
    renderEvents(rawEvents); // buat tampilin kartu di page
  } catch (err) {
    eventsListEl.innerHTML = `<div class="empty">Error: ${err.message}</div>`;
  }
}

// tampilin kartu di page
function renderEvents(list) {
  if (!eventsListEl) return;

  if (!list.length) {
    eventsListEl.innerHTML = `<div class="empty">Belum ada event. Tambahkan event pertama Anda.</div>`;
    return;
  }

  // map() buat looping + return nilai baru untuk setiap item
  const cards = list
    .map((ev) => {
      const status = computeStatus(ev.event_date);
      const quota = ev.quota ?? 0;
      const sold = ev.tickets_sold ?? 0;
      const pct = quota ? Math.min(100, Math.round((sold / quota) * 100)) : 0; // persen tiket terjual untuk progress bar
      const loc = locationMap[ev.location_id] || {};

      const eventDate = new Date(ev.event_date);
      const dateFormatted = eventDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return `
            <article class="event-card-modern">
                <div class="event-header">
                    <h3 class="event-title-modern">${escapeHtml(
                      ev.event_name || "-"
                    )}</h3>
                    <span class="pill ${status}">${status}</span>
                </div>
                <div class="event-artist">Various Artists</div>
                
                <div class="event-details">
                    <div class="detail-item">
                        <span class="detail-icon"><img src="../../assets/calendar_v2.png" alt="calender"/></span>
                        <span>${dateFormatted}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-icon"><img src="../../assets/location.png" alt="calender"/></span>
                        <span>${escapeHtml(loc.address || "-")} (${escapeHtml(
        loc.city || "-"
      )})</span>
                    </div>
                </div>
                
                <div class="ticket-info">
                  <div class="ticket-label">
                    <span>Tiket Terjual</span>
                    <span class="ticket-count">${sold} / ${quota}</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${pct}%;"></div>
                  </div>
                </div>
                
                <div class="card-actions-modern">
                  <button class="btn-edit" onclick="editEvent(${
                    ev.event_id
                  })"><img src="../../assets/edit.png" /> Edit</button>
                  <button class="btn-delete" onclick="deleteEvent(${
                    ev.event_id
                  })"><img src="../../assets/bin.png" /> Hapus</button>
                </div>
            </article>`;
    })
    .join(""); // menggabungkan semua string jadi satu HTML

  eventsListEl.innerHTML = cards;
}

// statys di card
function computeStatus(dateStr) {
  if (!dateStr) return "upcoming";
  const today = new Date();
  const date = new Date(dateStr);
  if (isNaN(date)) return "upcoming";
  if (date.toDateString() === today.toDateString()) return "ongoing";
  return date > today ? "upcoming" : "completed";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, (s) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

// search by nama event dan kota
function applySearch() {
  const term = (searchInput?.value || "").toLowerCase();
  const filtered = rawEvents.filter((ev) => {
    const name = (ev.event_name || "").toLowerCase();
    const loc = locationMap[ev.location_id] || {};
    const locText = `${loc.city || ""} ${loc.address || ""}`.toLowerCase();
    return name.includes(term) || locText.includes(term);
  });
  renderEvents(filtered);
}

function editEvent(id) {
  window.location.href = `./eventEdit.html?id=${id}`;
}

async function deleteEvent(id) {
  if (!confirm("Hapus event ini?")) return;
  const formData = new FormData();
  formData.append("event_id", id);
  try {
    const res = await fetch(API.EVENT_DELETE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      fetchEvents();
    } else {
      alert("Gagal hapus: " + (data.message || "Terjadi kesalahan."));
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function bindButtons() {
  if (addButton) {
    addButton.addEventListener("click", () => {
      window.location.href = "./eventCreate.html";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
}

function initEventPage() {
  cacheDom();
  bindButtons();
  fetchEvents();
}

// export fungsi ke global (window)
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

// browser manggil initEVentPage saat seluruh struktur HTML sudah selesai dimuat, buat cegah null
document.addEventListener("DOMContentLoaded", initEventPage);
