/* ============================
   NAVBAR / USER STATE
============================ */

const loginBtn = document.querySelector('[data-auth="login"]');
const registerBtn = document.querySelector('[data-auth="register"]');
const logoutBtn = document.querySelector('[data-auth="logout"]');
const userLabel = document.querySelector('[data-auth="user"]');
const userAvatar = document.querySelector('[data-auth="user"] .avatar');
const userDropdown = document.querySelector('[data-auth="user"] .nav-dropdown');
const userToggle = document.querySelector(
  '[data-auth="user"] .nav-user-toggle'
);
const displayName = document.querySelector('[data-auth="user"] .username');
const PROFILE_BASE = "../api/storage/profile/";
const navMenu = document.querySelector(".nav-menu");
const DEFAULT_AVATAR = "./assets/userDefault.png";

const slider = document.querySelector(".event-scroll");

let isDown = false;
let startX;
let scrollLeft;

if (slider) {
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => (isDown = false));
  slider.addEventListener("mouseup", () => (isDown = false));
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
}

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

document.addEventListener("DOMContentLoaded", initNavActive);

/* ============================
   USER DROPDOWN
============================ */

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeUserDropdown();
  });
}

document.addEventListener("DOMContentLoaded", initUserDropdown);

async function checkSession() {
  try {
    const res = await fetch("../api/index.php?action=user_show", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("not logged in");

    const { data } = await res.json();
    const user = data || {};
    const role = (user.role || "").toLowerCase();

    if (role === "admin") {
      window.location.href = "./admin/event/event.html";
      return;
    }

    if (role && role !== "customer" && role !== "user") {
      throw new Error("not customer");
    }

    if (displayName) {
      displayName.textContent = user.username || "Customer";
    }

    showLoggedIn(user);
  } catch {
    window.location.href = "./login.html";
  }
}

function showLoggedIn(userData) {
  if (loginBtn) loginBtn.style.display = "none";
  if (registerBtn) registerBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-flex";

  if (userLabel) {
    userLabel.style.display = "inline-flex";
    const nameText = userData?.username || "User";
    const emailText = "Customer";
    const nameEl = userLabel.querySelector(".username");
    const emailEl = userLabel.querySelector(".email");
    if (nameEl) nameEl.textContent = nameText;
    if (emailEl) emailEl.textContent = emailText;
  }

  if (userAvatar) {
    const photo = userData?.user_profile
      ? PROFILE_BASE + userData.user_profile + `?t=${Date.now()}`
      : DEFAULT_AVATAR;
    userAvatar.onerror = () => {
      userAvatar.onerror = null;
      userAvatar.src = DEFAULT_AVATAR;
    };
    userAvatar.src = photo;
  }
}

function showLoggedOut() {
  if (loginBtn) loginBtn.style.display = "inline-flex";
  if (registerBtn) registerBtn.style.display = "inline-flex";
  if (logoutBtn) logoutBtn.style.display = "none";

  if (userLabel) {
    userLabel.style.display = "none";
    const nameEl = userLabel.querySelector(".username");
    const emailEl = userLabel.querySelector(".email");
    if (nameEl) nameEl.textContent = "";
    if (emailEl) emailEl.textContent = "";
  }

  if (userAvatar) {
    userAvatar.src = DEFAULT_AVATAR;
  }

  closeUserDropdown();
}

async function handleLogout() {
  try {
    await fetch("../api/index.php?action=logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}
  showLoggedOut();
  window.location.href = "./login.html";
}

/* ============================
EVENT LIST
============================ */

const API_EVENTS = "../api/index.php?action=events";
const API_LOCATIONS = "../api/index.php?action=locations";

const eventContainer = document.getElementById("eventContainer");
const eventSearch = document.getElementById("eventSearch");
if (eventContainer) {
  eventContainer.classList.add("event-scroll");
}

let locationMap = {};
let allEvents = [];

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
  eventContainer.innerHTML = events.map((ev) => createEventCard(ev)).join("");
}

function filterEvents(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderEvents(allEvents);
    return;
  }
  const filtered = allEvents.filter((ev) =>
    (ev.event_name || "").toLowerCase().includes(q)
  );
  renderEvents(filtered);
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

if (eventContainer) {
  eventContainer.addEventListener("click", (e) => {
    const target = e.target.closest("[data-event-id]");
    if (!target) return;
    const id = target.getAttribute("data-event-id");
    if (!id) return;
    e.preventDefault();
    buyTicket(id);
  });
}

if (eventContainer) {
  loadEvents();
}

if (eventSearch) {
  eventSearch.addEventListener("input", (e) => filterEvents(e.target.value));
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

checkSession();
