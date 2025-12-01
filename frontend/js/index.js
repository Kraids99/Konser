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

    userLabel.style.display = "inline-flex";
    userLabel.textContent = username;
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

// **INI PATH YANG BENAR UNTUK index.html**
const API_EVENTS = "../api/index.php?action=events";

const eventContainer = document.getElementById("eventContainer");


eventContainer.classList.add("event-scroll");

eventContainer.innerHTML += `
    <div class="event-card">
        <img src="https://source.unsplash.com/400x300/?concert" />
        <div class="event-content">
            <h3 class="event-title">Judul Konser</h3>
            <p class="price-label">Mulai dari</p>
            <p class="price">Rp 250.000</p>
            <button class="btn-buy">Beli Tiket</button>
        </div>
    </div>
`;

async function loadEvents() {
    try {
        const res = await fetch(API_EVENTS);
        const data = await res.json();

        if (!res.ok || data.status !== "success") {
            eventContainer.innerHTML = `<p style="color:var(--muted);">Gagal memuat event.</p>`;
            return;
        }

        const events = data.data;

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
    eventContainer.innerHTML = events.map(ev => createEventCard(ev)).join("");
}

function createEventCard(ev) {
    const imgUrl = ev.image_url || "https://images.unsplash.com/photo-1511379938547-c1f69419868d";
    const dateObj = new Date(ev.event_date);

    const dateFormatted = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const timeFormatted = dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }) + " WIB";

    return `
        <div class="event-card">
            <img src="${imgUrl}" alt="${ev.event_name}">
            <div class="event-content">
                <div class="event-title">${ev.event_name}</div>
                <div class="event-artist">${ev.artist_name || "Various Artists"}</div>

                <div class="event-info">
                    📅 ${dateFormatted} <br>
                    ⏰ ${timeFormatted} <br>
                    📍 ${ev.event_location}
                </div>

                <div class="event-price">Mulai dari Rp ${(ev.price_min || 0).toLocaleString()}</div>

                <button class="btn btn-primary" onclick="buyTicket(${ev.event_id})">
                    Beli Tiket
                </button>
            </div>
        </div>
    `;
}

function buyTicket(eventId) {
    window.location.href = `./event_detail.html?id=${eventId}`;
}

// jalankan
loadEvents();

if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
}

checkSession();