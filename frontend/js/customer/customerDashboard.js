import { API, STORAGE } from "../index.js";

const DEFAULT_AVATAR = "./assets/userDefault.png";

let userLabel;
let userAvatar;
let userDropdown;
let userToggle;
let displayName;
let useLocationBtn;
let navMenu;
let slider;
let eventContainer;
let eventSearch;

let isDown = false;
let startX;
let scrollLeft;
let locationMap = {};
let allEvents = [];
let lastSortedByLocation = false;
let locationActive = false;

//ambil element
function cacheDom() {
  userLabel = document.querySelector('[data-auth="user"]');
  userAvatar = document.querySelector('[data-auth="user"] .avatar');
  userDropdown = document.querySelector('[data-auth="user"] .nav-dropdown');
  userToggle = document.querySelector('[data-auth="user"] .nav-user-toggle');
  displayName = document.querySelector('[data-auth="user"] .username');
  useLocationBtn = document.getElementById("useLocationBtn");
  navMenu = document.querySelector(".nav-menu");
  slider = document.querySelector(".event-scroll");
  eventContainer = document.getElementById("eventContainer");
  eventSearch = document.getElementById("eventSearch");

  if (eventContainer) {
    eventContainer.classList.add("event-scroll");
  }
}

// function initSliderDrag() {
//   if (!slider) return;

//   slider.addEventListener("mousedown", (e) => {
//     isDown = true;
//     startX = e.pageX - slider.offsetLeft;
//     scrollLeft = slider.scrollLeft;
//   });
//   slider.addEventListener("mouseleave", () => (isDown = false));
//   slider.addEventListener("mouseup", () => (isDown = false));
//   slider.addEventListener("mousemove", (e) => {
//     if (!isDown) return;
//     e.preventDefault();
//     const x = e.pageX - slider.offsetLeft;
//     const walk = (x - startX) * 2;
//     slider.scrollLeft = scrollLeft - walk;
//   });
// }

//untuk menampilkan concerTix, profil, membuat menu ada biru biru
function initNavActive() {
  if (!navMenu) return;
  const links = Array.from(navMenu.querySelectorAll("a"));
  if (!links.length) return;

  const setActiveByHref = (href) => {
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === href);
    });
  };

  navMenu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    setActiveByHref(link.getAttribute("href"));
  });

  const handleHashChange = () => {
    const hash = window.location.hash || links[0].getAttribute("href");
    setActiveByHref(hash);
  };

  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
}

function closeUserDropdown() {
  if (userDropdown) userDropdown.classList.remove("open");
}

function initUserDropdown() {
  if (!userToggle || !userDropdown) return;

  userToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!userDropdown.classList.contains("open")) return;
    const inside =
      userDropdown.contains(e.target) || userToggle.contains(e.target);
    if (!inside) closeUserDropdown();
  });
}

// pastikan user login dan role customer; alihkan admin
async function checkSession() {
  try {
    //Memanggil API backend untuk mengambil info user yang sedang login
    const res = await fetch(API.USER_SHOW, {
      credentials: "include",
    });

    //kalau respon gk ok
    if (!res.ok) throw new Error("not logged in");

    //ambil data json di be
    const { data } = await res.json();
    const user = data || {};
    const role = (user.role || "").toLowerCase();

    //cek role
    if (role === "admin") {
      window.location.href = "./admin/event/event.html";
      return;
    }

    if (role && role !== "customer" && role !== "user") {
      throw new Error("not customer");
    }

    //jika lolos, tampilkan nama user di navbar
    if (displayName) {
      displayName.textContent = user.username || "Customer";
    }

    //tampil avatar
    showLoggedIn(user);
  } catch {
    window.location.href = "./login.html";
  }
}

function showLoggedIn(userData) {
  //ambil nama element dan nama di be lalu ubah di tampilan
  if (userLabel) {
    userLabel.style.display = "inline-flex";
    const nameText = userData?.username || "User";
    const emailText = "Customer";
    const nameEl = userLabel.querySelector(".username");
    const emailEl = userLabel.querySelector(".email");
    if (nameEl) nameEl.textContent = nameText;
    if (emailEl) emailEl.textContent = emailText;
  }

  //ambil poto dari be
  if (userAvatar) {
    const photo = userData?.user_profile
      ? STORAGE.PROFILE + userData.user_profile + `?t=${Date.now()}`
      : DEFAULT_AVATAR;
    userAvatar.onerror = () => {
      userAvatar.onerror = null;
      userAvatar.src = DEFAULT_AVATAR;
    };
    userAvatar.src = photo;
  }
}

async function loadLocations() {
  // ambil daftar lokasi untuk mapping jarak
  try {
    const res = await fetch(API.LOCATIONS);
    const data = await res.json();
    if (!res.ok || data.status !== "success") return;
    (data.data || []).forEach((loc) => {
      locationMap[loc.location_id] = loc;
    });
  } catch {}
}

async function loadEvents() {
  if (!eventContainer) return;
  try {
    if (!Object.keys(locationMap).length) {
      await loadLocations();
    }
    const res = await fetch(API.EVENTS);
    const data = await res.json();

    if (!res.ok || data.status !== "success") {
      eventContainer.innerHTML = `<p style="color:var(--muted);">Gagal memuat event.</p>`;
      return;
    }

    allEvents = data.data || [];

    if (!allEvents.length) {
      eventContainer.innerHTML = `<p style="color:var(--muted);">Belum ada event tersedia.</p>`;
      return;
    }

    renderEvents(allEvents);
  } catch (err) {
    eventContainer.innerHTML = `<p style="color:var(--muted);">Error: ${err.message}</p>`;
  }
}

function renderEvents(events) {
  if (!eventContainer) return;
  //Untuk setiap event ev -> panggil createEventCard(ev)->di join -> dimasukkan ke container
  eventContainer.innerHTML = events.map((ev) => createEventCard(ev)).join("");
}

//search by name
function filterEvents(query) {
  const q = query.trim().toLowerCase();

  //kalau inputan kosong
  if (!q) {
    renderEvents(lastSortedByLocation ? sortByLocation(allEvents) : allEvents);
    return;
  }
  const baseList = lastSortedByLocation ? sortByLocation(allEvents) : allEvents;
  const filtered = baseList.filter((ev) =>
    (ev.event_name || "").toLowerCase().includes(q)
  );
  renderEvents(filtered);
}

// bagian alex
function haversine(lat1, lon1, lat2, lon2) {
  // hitung jarak antar koordinat (km)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// bagian alex
function sortByLocation(list, coords) {
  if (!coords) return list;
  const sorted = [...list].map((ev) => {
    const loc = locationMap[ev.location_id] || {};
    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);
    const distance =
      isNaN(lat) || isNaN(lon)
        ? Number.POSITIVE_INFINITY
        : haversine(coords.lat, coords.lon, lat, lon);
    return { ev, distance };
  });
  sorted.sort((a, b) => a.distance - b.distance);
  return sorted.map((item) => item.ev);
}

// bagian alex
function handleUseLocation() {
  if (!useLocationBtn) return;
  // matikan mode lokasi jika sedang aktif
  if (locationActive) {
    locationActive = false;
    lastSortedByLocation = false;
    renderEvents(allEvents);
    useLocationBtn.textContent = "Gunakan Lokasi";
    return;
  }

  if (!navigator.geolocation) {
    alert("Browser tidak mendukung geolokasi.");
    return;
  }
  useLocationBtn.disabled = true;
  useLocationBtn.textContent = "Mengambil lokasi...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      };
      lastSortedByLocation = true;
      locationActive = true;
      const sorted = sortByLocation(allEvents, coords);
      renderEvents(sorted);
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "Lokasi aktif";
    },
    () => {
      alert("Gagal membaca lokasi. Pastikan izin lokasi diaktifkan.");
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "Gunakan Lokasi";
    }
  );
}

function createEventCard(ev) {
  const dateObj = new Date(ev.event_date);
  const quota = ev.quota ?? 0;
  const sold = ev.tickets_sold ?? 0;
  const pct = quota ? Math.min(100, Math.round((sold / quota) * 100)) : 0;

  const dateFormatted = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const loc = locationMap[ev.location_id] || {};

  return `
    <div class="event-card">
      <div class="event-content">
        <div class="event-header">
          <div>
            <div class="event-title">${ev.event_name}</div>
            <div class="event-artist">${
              ev.artist_name || "Various Artists"
            }</div>
          </div>
          <span class="event-badge">upcoming</span>
        </div>

        <div class="event-meta">
          <div class="meta-row">
            <img src="./assets/calendar_v2.png" alt="Tanggal" class="meta-icon" />
            <span>${dateFormatted}</span>
          </div>
          <div class="meta-row">
            <img src="./assets/location.png" alt="Lokasi" class="meta-icon" />
            <span>${loc.address || "-"}${loc.city ? ", " + loc.city : ""}</span>
          </div>
        </div>

        <div class="ticket-info">
          <div class="ticket-label-row">
            <span class="ticket-label">Tiket Terjual</span>
            <span class="ticket-count">${sold} / ${quota}</span>
          </div>
          <div class="ticket-bar">
            <div class="ticket-fill" style="width:${pct}%;"></div>
          </div>
        </div>

        <div class="event-actions">
          <a class="btn-primary" data-event-id="${
            ev.event_id
          }" href="./ticket.html?id=${ev.event_id}">Pesan</a>
        </div>
      </div>
    </div>
  `;
}

function buyTicket(eventId) {
  window.location.href = `./ticket.html?id=${eventId}`;
}

function initEventClicks() {
  if (!eventContainer) return;
  eventContainer.addEventListener("click", (e) => {
    const target = e.target.closest("[data-event-id]");
    if (!target) return;
    const id = target.getAttribute("data-event-id");
    if (!id) return;
    e.preventDefault();
    buyTicket(id);
  });
}

function initCustomerDashboard() {
  cacheDom();
  // initSliderDrag();
  initNavActive();
  initUserDropdown();
  initEventClicks();

  if (eventSearch) {
    eventSearch.addEventListener("input", (e) => filterEvents(e.target.value));
  }

  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", handleUseLocation);
  }

  loadEvents();
  checkSession();
}

document.addEventListener("DOMContentLoaded", initCustomerDashboard);
