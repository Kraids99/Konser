// uncomment kode ini utk liat contoh klo ada history
const purchaseHistory = [
  // {
  //   event: "Konser Sheila On 7",
  //   date: "12 Jan 2025",
  //   location: "Jakarta Convention Center",
  //   ticket: "VIP",
  //   price: "Rp 750.000"
  // },
  // {
  //   event: "Konser Sheila On 8",
  //   date: "12 Jan 2025",
  //   location: "Jakarta Convention Center",
  //   ticket: "VIP",
  //   price: "Rp 750.000"
  // },
  // {
  //   event: "Konser Sheila On 9",
  //   date: "12 Jan 2025",
  //   location: "Jakarta Convention Center",
  //   ticket: "VIP",
  //   price: "Rp 750.000"
  // }
];

const container = document.getElementById("historyContainer");

// Jika tidak ada history → tampilkan empty state
if (purchaseHistory.length === 0) {
  container.innerHTML = `
        <div class="history-empty">
          <div class="empty-icon">
            <img src="./assets/empty.png" alt="No History">
          </div>
          <h2>Belum Ada Riwayat</h2>
          <p>Anda belum pernah membeli tiket. Mulai jelajahi konser yang tersedia!</p>
        </div>
      `;
}

// Jika ada history → tampilkan list riwayat
else {
  container.innerHTML = purchaseHistory
    .map(
      (item) => `
          <div class="history-item">
            <img src="./assets/konserindex.avif" alt="Poster Event" class="history-img">

            <div class="history-info">
              <h3>${item.event}</h3>
              <p>Tanggal: <strong>${item.date}</strong></p>
              <p>Lokasi: ${item.location}</p>
              <p>Tiket: ${item.ticket}</p>
              <p>Harga: <strong>${item.price}</strong></p>
            </div>
          </div>
        `
    )
    .join("");
}

// balek ke page td
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}
window.goBack = goBack;