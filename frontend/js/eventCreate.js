const API_CREATE = "../../../api/index.php?action=event_create";
const form = document.getElementById("eventForm");
const statusEl = document.getElementById("formStatus");
const backBtn = document.getElementById("backBtn");

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
      statusEl.textContent = "✓ Berhasil menambah event. Mengalihkan...";
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
