import { API } from "../index.js";

// simpan data checkout yang sudah dipilih sebelumnya
let checkoutData = null;
let userId = null;

let tabButtons = [];
let walletSection;
let bankSection;
let orderTitleEl;
let ticketCardsEl;
let orderPriceEl;
let subtotalEl;
let feeEl;
let totalEl;
let payBtn;
let closeBtn;

//buat aktifin wallet / bank & nampilin ui
function setMethod(method) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.payMethod === method;
    btn.classList.toggle("active", isActive);
  });

  if (walletSection) walletSection.classList.toggle("hidden", method !== "ewallet");
  if (bankSection) bankSection.classList.toggle("hidden", method !== "bank");
}

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function loadCheckoutData() {
  // tarik data checkout dari sessionStorage ke tampilan
  try {
    const raw = sessionStorage.getItem("checkoutData");
    if (!raw) return;
    const data = JSON.parse(raw);
    checkoutData = data;
    const tickets = data.tickets || [];

    const subtotal =
      data.totals?.amount ||
      tickets.reduce(
        (sum, t) => sum + (t.subtotal ?? (t.qty || 0) * (t.price || 0)),
        0
      );
    const total = subtotal;

    if (orderTitleEl) orderTitleEl.textContent = data.event_name || "Pesanan";

    if (ticketCardsEl) {
      if (!tickets.length) {
        ticketCardsEl.innerHTML = '<div class="ticket-card empty">Belum ada tiket dipilih.</div>';
      } else {
        ticketCardsEl.innerHTML = tickets
          .map((t) => {
            const qty = t.qty || 0;
            const price = Number(t.price || 0);
            const sub = t.subtotal ?? qty * price;
            return `
              <div class="ticket-card">
                <div>
                  <div class="ticket-type">${t.ticket_type || "Tiket"}</div>
                  <div class="ticket-meta">${qty} x ${formatRupiah(price)}</div>
                </div>
                <div class="ticket-price">${formatRupiah(sub)}</div>
              </div>`;
          })
          .join("");
      }
    }

    if (orderPriceEl) orderPriceEl.textContent = formatRupiah(subtotal);

    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (totalEl) totalEl.textContent = formatRupiah(total);
    if (payBtn) payBtn.textContent = `Bayar ${formatRupiah(total)}`;
  } catch (err) {
    console.error("Gagal load checkoutData:", err);
  }
}

function handleClose() {
  try {
    if (!checkoutData) {
      const raw = sessionStorage.getItem("checkoutData");
      if (raw) checkoutData = JSON.parse(raw);
    }
  } catch {}

  sessionStorage.removeItem("checkoutData");
  const hasHistory = window.history.length > 1;
  if (hasHistory) {
    window.history.back();
    return;
  }
  const eventId = checkoutData?.event_id;
  window.location.href = eventId
    ? `./ticket.html?id=${eventId}`
    : "./customerDashboard.html";
}

//fetch data user untuk transaksi
async function fetchUser() {
  try {
    const res = await fetch(API.USER_SHOW, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === "success" && data.data?.user_id) {
      const u = data.data;
      userId = u.user_id;
    }
  } catch (err) {
    console.error("Gagal mengambil user:", err);
  }
}


function getSelectedPayMethod() {
  const active = document.querySelector(".tab-btn.active");
  return active?.dataset?.payMethod || "ewallet";
}

function getSelectedWallet() {
  const w = document.querySelector('input[name="wallet"]:checked');
  return w ? w.nextElementSibling?.textContent?.trim() || "E-Wallet" : "E-Wallet";
}

function getSelectedBank() {
  const b = document.querySelector('input[name="bank"]:checked');
  return b ? b.nextElementSibling?.textContent?.trim() || "Bank" : "Bank";
}

async function submitTransaction() {
  if (!checkoutData || !checkoutData.tickets?.length) {
    alert("Tidak ada data checkout. Silakan pilih tiket kembali.");
    window.location.href = "./ticket.html";
    return;
  }

  if (!userId) {
    alert("Silakan login terlebih dahulu sebelum melakukan pembayaran.");
    window.location.href = "./login.html";
    return;
  }

  const firstTicket = checkoutData.tickets[0];
  if (!firstTicket.ticket_id) {
    alert("Ticket ID tidak ditemukan.");
    return;
  }

  const method = getSelectedPayMethod();
  const metodePembayaran =
    method === "bank" ? `${getSelectedBank()}` : `${getSelectedWallet()}`;

  const form = new FormData();
  if (userId) form.append("user_id", userId);
  form.append("ticket_id", firstTicket.ticket_id);
    form.append("ticket_token", "T" + Date.now());
    form.append("quantity", checkoutData.totals?.qty || firstTicket.qty || 1);
    form.append("total", checkoutData.totals?.amount || firstTicket.subtotal || 0);
    form.append("metode_pembayaran", metodePembayaran);

  try {
    const res = await fetch(API.TRANSACTION_CREATE, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      alert("Transaksi berhasil disimpan.");
      sessionStorage.removeItem("checkoutData");
      sessionStorage.setItem("paymentCompleted", "true");
      window.location.href = "./customerDashboard.html";
    } else {
      alert(data.message || "Gagal menyimpan transaksi.");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

//buat pindah pindah wallet <-> bank
function attachTabListeners() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setMethod(btn.dataset.payMethod);
    });
  });
}

function initTransactionPage() {
  tabButtons = Array.from(document.querySelectorAll("[data-pay-method]"));
  walletSection = document.getElementById("walletSection");
  bankSection = document.getElementById("bankSection");
  orderTitleEl = document.getElementById("orderEventTitle");
  ticketCardsEl = document.getElementById("ticketCards");
  orderPriceEl = document.getElementById("orderPrice");
  subtotalEl = document.getElementById("subtotalPrice");
  feeEl = document.getElementById("feePrice");
  totalEl = document.getElementById("totalPrice");
  payBtn = document.getElementById("payNowBtn");
  closeBtn = document.querySelector(".icon-btn");

  if (tabButtons.length) {
    setMethod("ewallet");
    attachTabListeners();
  }

  if (payBtn) {
    payBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitTransaction();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleClose();
    });
  }

  loadCheckoutData();
  fetchUser();
}

document.addEventListener("DOMContentLoaded", initTransactionPage);
