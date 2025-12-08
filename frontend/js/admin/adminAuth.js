import { API } from "../index.js";

// cek apakah user adalah admin
export async function cekAdmin(options = {}) {
  const {
    redirectLogin = "../../login.html",
  } = options;

  try {
    const res = await fetch(API.USER_SHOW, { credentials: "include" });
    if (!res.ok) {
      window.location.href = redirectLogin;
      return false;
    }
    const { data } = await res.json();
    const role = (data?.role || "").toLowerCase();
    if (role !== "admin") {
      window.location.href = redirectLogin;
      return false;
    }
    return true;
  } catch {
    window.location.href = redirectLogin;
    return false;
  }
}
