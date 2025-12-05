const API_BASE = "../api/index.php";
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id") || params.get("event_id");

const optionsContainer = document.getElementById("ticketOptions");
const totalTicketsEl = document.getElementById("totalTickets");
const totalPriceEl = document.getElementById("totalPrice");
const payBtn = document.getElementById("payBtn");

const titleEl = document.getElementById("eventTitle");
const artistEl = document.getElementById("eventArtist");
const dateEl = document.getElementById("eventDate");
const timeEl = document.getElementById("eventTime");
const locationEl = document.getElementById("eventLocation");
const heroEl = document.getElementById("heroShot");
const aboutEl = document.getElementById("eventAbout");

let ticketOptionsData = [];
const cart = {};
let eventData = null;
let locationData = null;
let totalsState = { qty: 0, amount: 0 };

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function formatDateTime(dateStr) {
  if (!dateStr) return { dateText: "-", timeText: "-" };
  const dt = new Date(dateStr);
  if (isNaN(dt)) return { dateText: "-", timeText: "-" };
  const dateText = dt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeText =
    dt.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";
  return { dateText, timeText };
}

function renderOptions() {
  if (!ticketOptionsData.length) {
    optionsContainer.innerHTML = `<div class="ticket-option" style="grid-template-columns:1fr;"><div class="ticket-info"><h4>Tiket belum tersedia</h4><div class="stock">Coba lagi nanti.</div></div></div>`;
    updateTotals();
    return;
  }

  optionsContainer.innerHTML = ticketOptionsData
    .map(
      (t) => `
      <div class="ticket-option" data-id="${t.id}">
        <div class="ticket-info">
          <h4>${t.name}</h4>
          <div class="stock">Tersedia: ${t.stockText}</div>
        </div>
        <div class="ticket-price">${formatRupiah(t.price)}</div>
        <div class="stepper">
          <button class="step-btn minus" aria-label="Kurangi">-</button>
          <div class="qty">${cart[t.id] || 0}</div>
          <button class="step-btn plus" aria-label="Tambah">+</button>
        </div>
      </div>`
    )
    .join("");

  attachStepperHandlers();
  updateTotals();
}

function attachStepperHandlers() {
  const optionEls = optionsContainer.querySelectorAll(".ticket-option");
  optionEls.forEach((el) => {
    const id = el.dataset.id;
    const minus = el.querySelector(".minus");
    const plus = el.querySelector(".plus");
    const qtyEl = el.querySelector(".qty");
    const data = ticketOptionsData.find((t) => t.id === id);

    minus.addEventListener("click", () => {
      cart[id] = Math.max(0, (cart[id] || 0) - 1);
      qtyEl.textContent = cart[id];
      updateTotals();
      updateDisabledState(data, minus, plus);
    });

    plus.addEventListener("click", () => {
      const next = (cart[id] || 0) + 1;
      if (data.maxStock !== null && next > data.maxStock) return;
      cart[id] = next;
      qtyEl.textContent = cart[id];
      updateTotals();
      updateDisabledState(data, minus, plus);
    });

    updateDisabledState(data, minus, plus);
  });
}

function updateDisabledState(data, minus, plus) {
  const qty = cart[data.id] || 0;
  minus.disabled = qty <= 0;
  plus.disabled = data.maxStock !== null ? qty >= data.maxStock : false;
}

function updateTotals() {
  const totals = ticketOptionsData.reduce(
    (acc, t) => {
      const qty = cart[t.id] || 0;
      acc.qty += qty;
      acc.amount += qty * t.price;
      return acc;
    },
    { qty: 0, amount: 0 }
  );

  totalsState = totals;
  totalTicketsEl.textContent = totals.qty;
  totalPriceEl.textContent = formatRupiah(totals.amount);
}

async function loadEvent() {
  if (!eventId) return null;
  const res = await fetch(`${API_BASE}?action=event_show&id=${eventId}`);
  const data = await res.json();
  if (!res.ok || data.status !== "success") return null;
  return data.data;
}

async function loadLocation(locId) {
  if (!locId) return null;
  const res = await fetch(`${API_BASE}?action=location_show&id=${locId}`);
  const data = await res.json();
  if (!res.ok || data.status !== "success") return null;
  return data.data;
}

async function loadTickets() {
  const res = await fetch(`${API_BASE}?action=tickets`);
  const data = await res.json();
  if (!res.ok || data.status !== "success") return [];
  const allTickets = data.data || [];
  if (eventId) {
    return allTickets.filter((t) => String(t.event_id) === String(eventId));
  }
  return allTickets;
}

function applyEventToUI(ev, loc) {
  if (titleEl) titleEl.textContent = ev?.event_name || "Event";
  if (artistEl) artistEl.textContent = ev?.artist_name || "Various Artists";

  const { dateText, timeText } = formatDateTime(ev?.event_date);
  if (dateEl) dateEl.textContent = dateText;
  if (timeEl) timeEl.textContent = timeText;

  if (locationEl) {
    const locText = loc
      ? `${loc.address || "-"}, ${loc.city || "-"}`
      : "Lokasi belum diisi";
    locationEl.textContent = locText;
  }

  if (aboutEl) {
    aboutEl.textContent = ev?.description || ev?.event_name || "Tentang ConcertiTx";
  }

  if (heroEl) {
    const img = ev?.image_url || ev?.banner_url || ev?.cover_url;
    if (img) {
      heroEl.style.backgroundImage = `url("${img}")`;
    }
  }
}

function mapTicketsToOptions(tickets) {
  ticketOptionsData = tickets.map((t) => {
    const maxStock = t.quota ?? null; // fallback if quota disediakan
    return {
      id: String(t.ticket_id ?? t.ticket_type ?? Math.random()),
      rawId: t.ticket_id ?? null,
      name: t.ticket_type || "Tiket",
      price: Number(t.price || 0),
      stockText: maxStock !== null ? `${maxStock} tiket` : "tersedia",
      maxStock: maxStock !== null ? Number(maxStock) : null,
    };
  });
}

async function initPage() {
  try {
    [eventData] = await Promise.all([loadEvent()]);
    if (eventData && eventData.location_id) {
      locationData = await loadLocation(eventData.location_id);
    }
    const tickets = await loadTickets();
    mapTicketsToOptions(tickets);
    renderOptions();
    applyEventToUI(eventData || {}, locationData || {});
  } catch (err) {
    console.error("Gagal memuat data:", err);
    optionsContainer.innerHTML =
      '<div class="ticket-option" style="grid-template-columns:1fr;"><div class="ticket-info"><h4>Terjadi kesalahan</h4></div></div>';
  }
}

payBtn.addEventListener("click", () => {
  if (!totalsState.qty) {
    alert("Pilih jumlah tiket terlebih dahulu.");
    return;
  }

  const selections = ticketOptionsData
    .filter((t) => (cart[t.id] || 0) > 0)
    .map((t) => ({
      ticket_id: t.rawId,
      ticket_type: t.name,
      price: t.price,
      qty: cart[t.id] || 0,
      subtotal: (cart[t.id] || 0) * t.price,
    }));

  const payload = {
    event_id: eventData?.event_id || eventId || null,
    event_name: eventData?.event_name || titleEl?.textContent || "",
    tickets: selections,
    totals: {
      qty: totalsState.qty,
      amount: totalsState.amount,
    },
    location: locationData || null,
  };

  sessionStorage.setItem("checkoutData", JSON.stringify(payload));
  window.location.href = "./transaction.html";
});

initPage();
