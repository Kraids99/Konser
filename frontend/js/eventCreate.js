const API_CREATE = "../../../api/index.php?action=event_create";
const API_LOCATIONS = "../../../api/index.php?action=locations";
const form = document.getElementById("eventForm");
const statusEl = document.getElementById("formStatus");
const backBtn = document.getElementById("backBtn");
const locationSelect = document.getElementById("location_id");

async function loadLocations() {
  try {
    const res = await fetch(API_LOCATIONS, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      statusEl.textContent = "Gagal memuat daftar lokasi.";
      statusEl.className = "status error";
      return;
    }
    const locations = data.data || [];
    locations.forEach((loc) => {
      const opt = document.createElement("option");
      opt.value = loc.location_id;
      opt.textContent = `${loc.city} - ${loc.address}`;
      locationSelect.appendChild(opt);
    });
  } catch (err) {
    statusEl.textContent = "Error memuat lokasi: " + err.message;
    statusEl.className = "status error";
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  statusEl.textContent = "Menyimpan event...";
  statusEl.className = "status";

  const formData = new FormData(form);

  try {
    const res = await fetch(API_CREATE, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      statusEl.textContent = "Berhasil menambah event. Mengalihkan...";
      statusEl.className = "status success";
      setTimeout(() => {
        window.location.href = "./event.html";
      }, 700);
    } else {
      statusEl.textContent =
        "Gagal: " + (data.message || "Terjadi kesalahan.");
      statusEl.className = "status error";
    }
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    statusEl.className = "status error";
  }
}

function goBack() {
  window.location.href = "./event.html";
}

loadLocations();
form.addEventListener("submit", handleSubmit);
backBtn.addEventListener("click", goBack);
