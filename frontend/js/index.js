// Toggle nav buttons based on login session
const loginBtn = document.querySelector('[data-auth="login"]');
const registerBtn = document.querySelector('[data-auth="register"]');
const logoutBtn = document.querySelector('[data-auth="logout"]');
const userLabel = document.querySelector('[data-auth="user"]');

// Cek status login via API (user_show)
async function checkSession() {
    try {
        const res = await fetch('../api/index.php?action=user_show', {
            credentials: 'include'
        });

        if (!res.ok) throw new Error("Not logged in");

        const json = await res.json();
        const username = json?.data?.username || 'User';

        showLoggedIn(username);

    } catch (err) {
        showLoggedOut();
    }
}

function showLoggedIn(username) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';

    if (userLabel) {
        userLabel.style.display = 'inline-flex';
        userLabel.textContent = username;
    }
}

function showLoggedOut() {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';

    if (userLabel) {
        userLabel.style.display = 'none';
        userLabel.textContent = '';
    }
}

// Logout handler
async function handleLogout() {
    try {
        await fetch('../api/index.php?action=logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (err) {
        console.error("Logout error:", err);
    } finally {
        showLoggedOut();
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

checkSession();