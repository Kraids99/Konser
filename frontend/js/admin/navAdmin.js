import { API, STORAGE } from "../index.js";

const DEFAULT_AVATAR = "../../assets/userDefault.png";

function ensureAvatarImg() {
  const avatarContainer = document.querySelector(".user-chip .avatar");
  if (!avatarContainer) return null;

  let avatarImg = avatarContainer.querySelector(".avatar-img");
  if (!avatarImg) {
    avatarImg = document.createElement("img");
    avatarImg.className = "avatar-img";
    avatarImg.alt = "User Avatar";
    avatarContainer.textContent = "";
    avatarContainer.appendChild(avatarImg);
  }
  return avatarImg;
}

async function loadUserChip() {
  const avatarImg = ensureAvatarImg();
  const userNameEl = document.querySelector(".user-chip .name");
  const userRoleEl = document.querySelector(".user-chip .role");

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
    // silent fail, keep default avatar/name
  }
}

export function initAdminNav() {
  loadUserChip();
}

initAdminNav();
