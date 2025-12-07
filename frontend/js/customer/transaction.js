const tabButtons = document.querySelectorAll("[data-pay-method]");
const walletSection = document.getElementById("walletSection");
const bankSection = document.getElementById("bankSection");
const orderTitleEl = document.getElementById("orderEventTitle");
const orderTypeEl = document.getElementById("orderTicketType");
const orderQtyPriceEl = document.getElementById("orderQtyPrice");
const orderPriceEl = document.getElementById("orderPrice");
const subtotalEl = document.getElementById("subtotalPrice");
const feeEl = document.getElementById("feePrice");
const totalEl = document.getElementById("totalPrice");
const payBtn = document.getElementById("payNowBtn");
const buyerNameInput = document.getElementById("buyerName");
const buyerEmailInput = document.getElementById("buyerEmail");
const buyerPhoneInput = document.getElementById("buyerPhone");
const API_BASE = "../api/index.php";
let checkoutData = null;
let userId = null;

function setMethod(method) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.payMethod === method;
    btn.classList.toggle("active", isActive);
  });

  if (walletSection) walletSection.classList.toggle("hidden", method !== "ewallet");
  if (bankSection) bankSection.classList.toggle("hidden", method !== "bank");
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    setMethod(btn.dataset.payMethod);
  });
});

// default to ewallet
setMethod("ewallet");

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function loadCheckoutData() {
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

loadCheckoutData();

async function fetchUser() {
  try {
    const res = await fetch(`${API_BASE}?action=user_show`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === "success" && data.data?.user_id) {
      const u = data.data;
      userId = u.user_id;
      if (buyerNameInput && u.username) buyerNameInput.value = u.username;
      if (buyerEmailInput && u.email) buyerEmailInput.value = u.email;
      if (buyerPhoneInput && u.telp) buyerPhoneInput.value = u.telp;
    }
  } catch (err) {
    console.error("Gagal mengambil user:", err);
  }
}

fetchUser();

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
  form.append("action", "transaction_create");

  try {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      alert("Transaksi berhasil disimpan.");
      sessionStorage.removeItem("checkoutData");
      window.location.href = "./index.html";
    } else {
      alert(data.message || "Gagal menyimpan transaksi.");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

if (payBtn) {
  payBtn.addEventListener("click", (e) => {
    e.preventDefault();
    submitTransaction();
  });
}
