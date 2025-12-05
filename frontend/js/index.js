/* ============================
   NAVBAR LOGIN STATE HANDLER
============================ */

const loginBtn = document.querySelector('[data-auth="login"]');
const registerBtn = document.querySelector('[data-auth="register"]');
const logoutBtn = document.querySelector('[data-auth="logout"]');
const userLabel = document.querySelector('[data-auth="user"]');

const slider = document.querySelector('.event-scroll');

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => isDown = false);
slider.addEventListener('mouseup', () => isDown = false);
slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // fast scroll
  slider.scrollLeft = scrollLeft - walk;
});

async function checkSession() {
  try {
    const res = await fetch("../api/index.php?action=user_show", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("not logged in");

    const { data } = await res.json();
        showLoggedIn(data?.username || "User");
  } catch {
    showLoggedOut();
  }
}

function showLoggedIn(username) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";

  if (userLabel) {
    userLabel.style.display = "inline-flex";
    userLabel.textContent = username;
}
}

function showLoggedOut() {
    loginBtn.style.display = "inline-flex";
    registerBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";

    userLabel.style.display = "none";
    userLabel.textContent = "";
}

async function handleLogout() {
  try {
    await fetch("../api/index.php?action=logout", {
      method: "POST",
      credentials: "include",
    });
    } catch { }
  showLoggedOut();
}


/* ============================
EVENT LIST
============================ */

const API_EVENTS = "../api/index.php?action=events";
const API_LOCATIONS = "../api/index.php?action=locations";

const eventContainer = document.getElementById("eventContainer");
eventContainer.classList.add("event-scroll");

let locationMap = {};

async function loadLocations() {
  try {
    const res = await fetch(API_LOCATIONS);
    const data = await res.json();
    if (!res.ok || data.status !== "success") return;
    (data.data || []).forEach((loc) => {
      locationMap[loc.location_id] = loc;
    });
  } catch {}
}

async function loadEvents() {
  try {
    if (!Object.keys(locationMap).length) {
      await loadLocations();
    }
    const res = await fetch(API_EVENTS);
    const data = await res.json();

    if (!res.ok || data.status !== "success") {
      eventContainer.innerHTML = `<p style="color:var(--muted);">Gagal memuat event.</p>`;
      return;
    }

    const events = data.data || [];

    if (!events.length) {
      eventContainer.innerHTML = `<p style="color:var(--muted);">Belum ada event tersedia.</p>`;
      return;
    }

    renderEvents(events);
  } catch (err) {
    eventContainer.innerHTML = `<p style="color:var(--muted);">Error: ${err.message}</p>`;
  }
}

function renderEvents(events) {
  eventContainer.innerHTML = events.map((ev) => createEventCard(ev)).join("");
}

function createEventCard(ev) {
  const imgUrl =
    ev.image_url ||
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d";
  const dateObj = new Date(ev.event_date);

  const dateFormatted = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatted =
    dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";

  const loc = locationMap[ev.location_id] || {};

  return `
        <div class="event-card">
            <img src="${imgUrl}" alt="${ev.event_name}">
            <div class="event-content">
                <div class="event-title">${ev.event_name}</div>
                <div class="event-artist">${ev.artist_name || "Various Artists"}</div>

                <div class="event-info">
                    📅 ${dateFormatted} <br>
                    🕒 ${timeFormatted} <br>
                    📍 ${loc.address || "-"}, ${loc.city || "-"}
                </div>

                <div class="event-price">Mulai dari Rp ${(ev.price_min || 0).toLocaleString()}</div>

                <a class="btn btn-primary" data-event-id="${ev.event_id}" href="./ticket.html?id=${ev.event_id}">
                    Beli Tiket
                </a>
            </div>
        </div>
    `;
}

function buyTicket(eventId) {
  window.location.href = `./ticket.html?id=${eventId}`;
}

// handle click delegation to keep redirect consistent
eventContainer.addEventListener("click", (e) => {
  const target = e.target.closest("[data-event-id]");
  if (!target) return;
  const id = target.getAttribute("data-event-id");
  if (!id) return;
  e.preventDefault();
  buyTicket(id);
});

// jalankan
loadEvents();

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

checkSession();
