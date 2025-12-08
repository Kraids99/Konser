import { API } from "./index.js";
//ngambil endpoint API kek user_show, ticket, transaction

//gambar fallback jika poster tidak ada
const DEFAULT_POSTER = "./assets/konserindex.avif";

//mengubah angka menjadi format Rupiah
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

let historyContainer; //variabel utk menyimpan daftar riwayat tiket

//fetch api yg penggunaanny bs direcycle
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include", //ttp bawa cookie utk cek session login
    ...opts,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

//memastikan user udh login
async function requireUser() {
  // alihkan ke login jika sesi tidak ada
  const { ok, data } = await fetchJson(API.USER_SHOW);
  if (!ok || data.status !== "success" || !data.data?.user_id) {
    window.location.href = "./login.html";
    return null;
  }
  return data.data; //mengembalikan data user 
}

//mengambil smw data ticket
async function loadTickets() {
  const { ok, data } = await fetchJson(API.TICKETS);
  if (!ok || data.status !== "success") return {};//kalo gagal return kosongan
  const map = {};
  (data.data || []).forEach((t) => {
    map[t.ticket_id] = t;//disimpan dalam bentuk map
  });
  return map;
}

// ambil seluruh transaksi, nanti difilter per user
async function loadTransactions() {
  const { ok, data } = await fetchJson(API.TRANSACTIONS);
  if (!ok || data.status !== "success") return [];
  return data.data || [];
}

//jika historycontainer kosong, tampilkan div di bawah
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

//menampilkan kartu riwayat
function renderHistory(items, ticketMap) {
  if (!historyContainer) return;

  if (!items.length) {//jika length kosong, maka panggil renderEmpty
    renderEmpty();
    return;
  }

  historyContainer.innerHTML = items
    .map((trx) => {
      const ticket = ticketMap[trx.ticket_id] || {};  //ambil ticket berdasarkan ticket_id dr trx
      const eventName = ticket.event_name || "Event"; //sama, klo gada tampilin event
      const ticketType = ticket.ticket_type || "-";   //tampilin -
      const price = ticket.price ?? 0;                //
      const qty = trx.quantity ?? 0;                  //
      const total = trx.total ?? price * qty;         //
      const location = ticket.address                 //
        ? `${ticket.address}${ticket.city ? ", " + ticket.city : ""}`
        : "-";//klo gada show -
      const dateStr = trx.created_at
        ? new Date(trx.created_at).toLocaleString("id-ID", { //format tgl indo
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "-";
      //kembalikan template html card utk 1 trx
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
    .join("");//gabungkan smw html card jd 1 string
}

async function initHistoryPage() {
  //nanti history ditampilin di historyContainer
  historyContainer = document.getElementById("historyContainer");
  if (!historyContainer) return;

  //cek apkh udh login
  const user = await requireUser();
  if (!user) return;

  //jalankan loadticket dan loadtransaction secara paralel
  const [ticketMap, transactions] = await Promise.all([
    loadTickets(),
    loadTransactions(),
  ]);

  //filter trx, user_id di trx dan user nya sama (brarti lg login)
  const filtered = transactions.filter(
    (trx) => Number(trx.user_id) === Number(user.user_id)
  );
  renderHistory(filtered, ticketMap);
}

//utk handle kembali ke page sblmnya.
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

window.goBack = goBack;
document.addEventListener("DOMContentLoaded", initHistoryPage);
