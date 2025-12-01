const API_SHOW = "../../../api/index.php?action=event_show";
const API_UPDATE = "../../../api/index.php?action=event_update";

const form = document.getElementById("eventForm");
const statusEl = document.getElementById("formStatus");
const backBtn = document.getElementById("backBtn");
const submitBtn = document.getElementById("submitBtn");

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

if (!eventId) {
  alert("ID event tidak ditemukan.");
  window.location.href = "./event.html";
} else {
  document.getElementById("event_id").value = eventId;
  loadEvent(eventId);
}

async function loadEvent(id) {
  statusEl.textContent = "Memuat data event...";
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

function fillForm(ev) {
  form.event_name.value = ev.event_name || "";
  form.event_location.value = ev.event_location || "";

  // Format date for input[type="date"]
  if (ev.event_date) {
    const date = new Date(ev.event_date);
    const formatted = date.toISOString().split("T")[0];
    form.event_date.value = formatted;
  }

  form.quota.value = ev.quota || "";
}

function enableForm() {
  form.event_name.disabled = false;
  form.event_location.disabled = false;
  form.event_date.disabled = false;
  form.quota.disabled = false;
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
      statusEl.textContent = "✓ Berhasil mengubah event. Mengalihkan...";
      statusEl.className = "status success";
      setTimeout(() => {
        window.location.href = "./event.html";
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
  window.location.href = "./event.html";
}

form.addEventListener("submit", handleSubmit);
backBtn.addEventListener("click", goBack);
