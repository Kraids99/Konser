import { API } from "./index.js";

// gambar fallback jika poster tidak ada
const DEFAULT_POSTER = "./assets/konserindex.avif";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

let historyContainer;

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function requireUser() {
  // alihkan ke login jika sesi tidak ada
  const { ok, data } = await fetchJson(API.USER_SHOW);
  if (!ok || data.status !== "success" || !data.data?.user_id) {
    window.location.href = "./login.html";
    return null;
  }
  return data.data;
}

async function loadTickets() {
  const { ok, data } = await fetchJson(API.TICKETS);
  if (!ok || data.status !== "success") return {};
  const map = {};
  (data.data || []).forEach((t) => {
    map[t.ticket_id] = t;
  });
  return map;
}

async function loadTransactions() {
  // ambil seluruh transaksi, nanti difilter per user
  const { ok, data } = await fetchJson(API.TRANSACTIONS);
  if (!ok || data.status !== "success") return [];
  return data.data || [];
}

function renderEmpty() {
  if (!historyContainer) return;
  historyContainer.innerHTML = `
    <div class="history-empty">
      <div class="empty-icon">
        <img src="./assets/empty.png" alt="No History">
      </div>
      <h2>Belum Ada Riwayat</h2>
      <p>Anda belum pernah membeli tiket. Mulai jelajahi konser yang tersedia!</p>
    </div>
  `;
}

function renderHistory(items, ticketMap) {
  if (!historyContainer) return;

  if (!items.length) {
    renderEmpty();
    return;
  }

  historyContainer.innerHTML = items
    .map((trx) => {
      const ticket = ticketMap[trx.ticket_id] || {};
      const eventName = ticket.event_name || "Event";
      const ticketType = ticket.ticket_type || "-";
      const price = ticket.price ?? 0;
      const qty = trx.quantity ?? 0;
      const total = trx.total ?? price * qty;
      const location = ticket.address
        ? `${ticket.address}${ticket.city ? ", " + ticket.city : ""}`
        : "-";
      const dateStr = trx.created_at
        ? new Date(trx.created_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      return `
        <article class="history-card">
          <header class="history-top">
            <div>
              <div class="event-name">${eventName}</div>
              <div class="pill pill-type">${ticketType}</div>
            </div>
            <div class="total-amount">${currency.format(total)}</div>
          </header>

          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">Lokasi</span>
              <span class="meta-value">${location}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Tanggal beli</span>
              <span class="meta-value">${dateStr}</span>
            </div>
            <div class="meta-row">
              <div class="meta-item">
                <span class="meta-label">Jumlah</span>
                <span class="meta-value">${qty} tiket</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Harga</span>
                <span class="meta-value">${currency.format(price)}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function initHistoryPage() {
  historyContainer = document.getElementById("historyContainer");
  if (!historyContainer) return;

  const user = await requireUser();
  if (!user) return;

  const [ticketMap, transactions] = await Promise.all([
    loadTickets(),
    loadTransactions(),
  ]);

  const filtered = transactions.filter(
    (trx) => Number(trx.user_id) === Number(user.user_id)
  );
  renderHistory(filtered, ticketMap);
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

window.goBack = goBack;
document.addEventListener("DOMContentLoaded", initHistoryPage);
