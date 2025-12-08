import { API } from "../../index.js";
import { cekAdmin } from "../adminAuth.js";

// daftar ticket untuk admin
let listEl;
let searchInput;
let addButtons = [];
let rawTickets = [];

function cacheDom() {
  listEl = document.getElementById("ticketsList");
  searchInput = document.getElementById("searchInput");
  addButtons = [
    document.getElementById("addTicketBtn"),
    document.getElementById("addTicketBtn2"),
  ].filter(Boolean);
}

async function fetchTickets() {
  if (!listEl) return;
  try {
    const res = await fetch(API.TICKETS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      listEl.innerHTML = `<div class="empty">Gagal memuat ticket.</div>`;
      return;
    }
    rawTickets = data.data || [];
    renderTickets(rawTickets);
  } catch (err) {
    listEl.innerHTML = `<div class="empty">Error: ${err.message}</div>`;
  }
}

function renderTickets(list) {
  if (!listEl) return;

  if (!list.length) {
    listEl.innerHTML = `<div class="empty">Belum ada ticket. Tambahkan ticket pertama Anda.</div>`;
    return;
  }

  const cards = list
    .map((t) => {
      const price = parseFloat(t.price || 0);
      const formattedPrice = price.toLocaleString("id-ID");
      const locText = `${t.address || "-"}${t.city ? " (" + t.city + ")" : ""}`;

      return `
            <article class="ticket-card-modern">
                <div class="ticket-header">
                    <h3 class="ticket-title-modern">${escapeHtml(
                      t.ticket_type || "-"
                    )}</h3>
                    <span class="pill ticket">ticket</span>
                </div>
                <div class="ticket-event-name">${escapeHtml(
                  t.event_name || "Event #" + t.event_id
                )}</div>
                
                <div class="ticket-details">
                    <div class="detail-item">
                        <span class="detail-icon"><img src="../../assets/ticket_v3.png" alt="ticket"/></span>
                        <span>Ticket ID: ${t.ticket_id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon"><img src="../../assets/calendar_event_v2.png" alt="Calendar Icon" /></span>
                        <span>Lokasi: ${escapeHtml(locText)}</span>
                    </div>
                </div>
                
                <div class="price-tag">
                  <div class="price-label">Harga Tiket</div>
                  <div class="price-amount">Rp ${formattedPrice}</div>
                </div>
                
                <div class="card-actions-modern">
                  <button class="btn-edit" onclick="editTicket(${
                    t.ticket_id
                  })"><img src="../../assets/edit.png" /> Edit</button>
                  <button class="btn-delete" onclick="deleteTicket(${
                    t.ticket_id
                  })"><img src="../../assets/bin.png" /> Hapus</button>
                </div>
            </article>`;
    })
    .join("");

  listEl.innerHTML = cards;
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

function applySearch() {
  const term = (searchInput?.value || "").toLowerCase();
  const filtered = rawTickets.filter((t) => {
    const type = (t.ticket_type || "").toLowerCase();
    const eventName = (t.event_name || "").toLowerCase();
    const eventId = String(t.event_id || "");
    const locText = `${t.city || ""} ${t.address || ""}`.toLowerCase();
    return (
      type.includes(term) ||
      eventName.includes(term) ||
      eventId.includes(term) ||
      locText.includes(term)
    );
  });
  renderTickets(filtered);
}

function editTicket(id) {
  window.location.href = `./ticketEdit.html?id=${id}`;
}

async function deleteTicket(id) {
  if (!confirm("Hapus ticket ini?")) return;
  const formData = new FormData();
  formData.append("ticket_id", id);
  try {
    const res = await fetch(API.TICKET_DELETE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      fetchTickets();
    } else {
      alert("Gagal hapus: " + (data.message || "Terjadi kesalahan."));
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function bindButtons() {
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "./ticketCreate.html";
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
}

async function initTicketPage() {
  cacheDom();
  bindButtons();
  const isAdmin = await cekAdmin();
  if (!isAdmin) return;
  fetchTickets();
}

window.editTicket = editTicket;
window.deleteTicket = deleteTicket;

document.addEventListener("DOMContentLoaded", initTicketPage);
