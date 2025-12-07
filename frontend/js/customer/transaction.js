import { API } from "../index.js";

// simpan data checkout yang sudah dipilih sebelumnya
let checkoutData = null;
let userId = null;

let tabButtons = [];
let walletSection;
let bankSection;
let orderTitleEl;
let orderTypeEl;
let orderQtyPriceEl;
let orderPriceEl;
let subtotalEl;
let feeEl;
let totalEl;
let payBtn;

function setMethod(method) {
  // ubah tab aktif dan tampilkan panel yang sesuai
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
    const firstTicket = data.tickets?.[0];

    const subtotal = data.totals?.amount || 0;
    const fee = 5000;
    const total = subtotal + fee;

    if (orderTitleEl) orderTitleEl.textContent = data.event_name || "Pesanan";
    if (orderTypeEl) orderTypeEl.textContent = firstTicket?.ticket_type || "-";
    if (orderQtyPriceEl)
      orderQtyPriceEl.textContent = firstTicket
        ? `${firstTicket.qty} x ${formatRupiah(firstTicket.price)}`
        : "-";
    if (orderPriceEl)
      orderPriceEl.textContent = formatRupiah(firstTicket?.subtotal || subtotal);

    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (feeEl) feeEl.textContent = formatRupiah(fee);
    if (totalEl) totalEl.textContent = formatRupiah(total);
    if (payBtn) payBtn.textContent = `Bayar ${formatRupiah(total)}`;
  } catch (err) {
    console.error("Gagal load checkoutData:", err);
  }
}

async function fetchUser() {
  // ambil user_id untuk transaksi
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
  // fallback ke ewallet jika belum dipilih
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

async function fetchEventById(id) {
  const res = await fetch(`${API.EVENT_SHOW}&id=${encodeURIComponent(id)}`);
  const data = await res.json();
  if (!res.ok || data.status !== "success") return null;
  return data.data;
}

async function updateEventQuota() {
  try {
    if (!checkoutData?.event_id || !checkoutData?.totals?.qty) return;
    const eventInfo = await fetchEventById(checkoutData.event_id);
    if (!eventInfo) return;
    const currentQuota = Number(eventInfo.quota || 0);
    const newQuota = Math.max(0, currentQuota - Number(checkoutData.totals.qty || 0));
    const form = new FormData();
    form.append("event_id", eventInfo.event_id);
    form.append("event_name", eventInfo.event_name || "");
    form.append("location_id", eventInfo.location_id || "");
    form.append("event_date", eventInfo.event_date || "");
    form.append("quota", newQuota);
    await fetch(API.EVENT_UPDATE, {
      method: "POST",
      body: form,
      credentials: "include",
    });
  } catch (err) {
    console.error("Gagal update quota event:", err);
  }
}

async function submitTransaction() {
  // validasi data checkout dan user sebelum bayar
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
      await updateEventQuota();
      window.location.href = "./customerDashboard.html";
    } else {
      alert(data.message || "Gagal menyimpan transaksi.");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function lockBackNavigation() {
  // cegah tombol back di tab ini setelah bayar
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", () => {
    window.history.pushState(null, "", window.location.href);
  });
}

function attachTabListeners() {
  // klik tab untuk ganti metode pembayaran
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
  orderTypeEl = document.getElementById("orderTicketType");
  orderQtyPriceEl = document.getElementById("orderQtyPrice");
  orderPriceEl = document.getElementById("orderPrice");
  subtotalEl = document.getElementById("subtotalPrice");
  feeEl = document.getElementById("feePrice");
  totalEl = document.getElementById("totalPrice");
  payBtn = document.getElementById("payNowBtn");

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

  loadCheckoutData();
  fetchUser();
  lockBackNavigation();
}

document.addEventListener("DOMContentLoaded", initTransactionPage);
