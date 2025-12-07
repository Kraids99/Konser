import { API, STORAGE } from "../index.js";

// avatar default untuk navbar admin
const DEFAULT_AVATAR = "../../assets/userDefault.png";

let avatarImg;
let userNameEl;
let userRoleEl;

function cacheDom() {
  const avatarContainer = document.querySelector(".user-chip .avatar");
  userNameEl = document.querySelector(".user-chip .name");
  userRoleEl = document.querySelector(".user-chip .role");

  if (!avatarContainer) return;

  avatarImg = avatarContainer.querySelector(".avatar-img");
  if (!avatarImg) {
    avatarImg = document.createElement("img");
    avatarImg.className = "avatar-img";
    avatarImg.alt = "User Avatar";
    avatarContainer.textContent = "";
    avatarContainer.appendChild(avatarImg);
  }
}

async function loadUserChip() {
  // isi nama, role, dan foto di navbar
  try {
    const res = await fetch(API.USER_SHOW, { credentials: "include" });
    if (!res.ok) return;
    const { data } = await res.json();

    if (data?.username && userNameEl) userNameEl.textContent = data.username;
    if (data?.role && userRoleEl) userRoleEl.textContent = data.role;

    if (avatarImg) {
      avatarImg.src = data?.user_profile
        ? `${STORAGE.PROFILE}${data.user_profile}`
        : DEFAULT_AVATAR;
    }
  } catch {
    // biarkan avatar default jika gagal
  }
}

export function initAdminNav() {
  cacheDom();
  loadUserChip();
}

document.addEventListener("DOMContentLoaded", initAdminNav);
