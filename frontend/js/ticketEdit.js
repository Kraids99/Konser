const API_SHOW = "../../../api/index.php?action=ticket_show";
const API_UPDATE = "../../../api/index.php?action=ticket_update";
const API_EVENTS = "../../../api/index.php?action=events";

const form = document.getElementById("ticketForm");
const statusEl = document.getElementById("formStatus");
const backBtn = document.getElementById("backBtn");
const submitBtn = document.getElementById("submitBtn");
const selectEvent = document.getElementById("event_id");

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

if (!ticketId) {
  alert("ID ticket tidak ditemukan.");
  window.location.href = "./ticket.html";
} else {
  document.getElementById("ticket_id").value = ticketId;
  loadEvents().then(() => loadTicket(ticketId));
}

async function loadEvents() {
  try {
    const res = await fetch(API_EVENTS, { credentials: "include" });
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

async function loadTicket(id) {
  statusEl.textContent = "Memuat data ticket...";
  statusEl.className = "status loading";
  try {
    const res = await fetch(`${API_SHOW}&id=${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      fillForm(data.data);
      statusEl.textContent = "";
      statusEl.className = "status";
      // Enable form fields
      enableForm();
    } else {
      statusEl.textContent =
        "✗ Gagal memuat: " + (data.message || "Terjadi kesalahan.");
      statusEl.className = "status error";
    }
  } catch (err) {
    statusEl.textContent = "✗ Error: " + err.message;
    statusEl.className = "status error";
  }
}

function fillForm(t) {
  form.ticket_type.value = t.ticket_type || "";
  form.price.value = t.price || "";
  selectEvent.value = t.event_id || "";
}

function enableForm() {
  form.event_id.disabled = false;
  form.ticket_type.disabled = false;
  form.price.disabled = false;
  submitBtn.disabled = false;
}

async function handleSubmit(e) {
  e.preventDefault();
  statusEl.textContent = "Menyimpan perubahan...";
  statusEl.className = "status loading";

  const formData = new FormData(form);

  try {
    const res = await fetch(API_UPDATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      statusEl.textContent = "✓ Berhasil mengubah ticket. Mengalihkan...";
      statusEl.className = "status success";
      setTimeout(() => {
        window.location.href = "./ticket.html";
      }, 700);
    } else {
      statusEl.textContent =
        "✗ Gagal: " + (data.message || "Terjadi kesalahan.");
      statusEl.className = "status error";
    }
  } catch (err) {
    statusEl.textContent = "✗ Error: " + err.message;
    statusEl.className = "status error";
  }
}

function goBack() {
  window.location.href = "./ticket.html";
}

form.addEventListener("submit", handleSubmit);
backBtn.addEventListener("click", goBack);
