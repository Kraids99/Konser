const namaInput = document.getElementById("nama");
const emailInput = document.getElementById("email");
const telpInput = document.getElementById("telp"); // optional, boleh tidak ada di form

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const changePassBtn = document.querySelector(".change-password-btn");
const logoutBtn = document.querySelector(".logout-btn");
const deleteBtn = document.querySelector(".delete-btn");

const oldPassInput = document.getElementById("oldPass");
const newPassInput = document.getElementById("newPass");
const confirmPassInput = document.getElementById("confirmPass");

const profileMsg = document.getElementById("profileMsg");
const passwordMsg = document.getElementById("passwordMsg");
const dangerMsg = document.getElementById("dangerMsg");
const photoMsg = document.getElementById("photoMsg");
const photoInput = document.getElementById("photoInput");
const changePhotoLink = document.querySelector(".change-photo");
const removePhotoLink = document.querySelector(".remove-photo");
const savePhotoBtn = document.getElementById("savePhotoBtn");
const photoEl = document.querySelector(".profile-photo");

const API_USER = "../api/index.php?action=user_show";
const API_UPDATE_PROFILE = "../api/index.php?action=user_update";
const API_UPDATE_PASSWORD = "../api/index.php?action=user_update_password";
const API_LOGOUT = "../api/index.php?action=logout";
const API_DELETE = "../api/index.php?action=user_delete";
const API_UPDATE_PHOTO = "../api/index.php?action=user_update_photo";
const PROFILE_BASE = "../api/storage/profile/";

let selectedPhotoFile = null;
let currentPhotoUrl = null;

function clearPasswordInputs() {
    if (oldPassInput) {
        oldPassInput.value = "";
        oldPassInput.setAttribute("autocomplete", "new-password");
    }
    if (newPassInput) {
        newPassInput.value = "";
        newPassInput.setAttribute("autocomplete", "new-password");
    }
    if (confirmPassInput) {
        confirmPassInput.value = "";
        confirmPassInput.setAttribute("autocomplete", "new-password");
    }
}

// helper untuk menaruh pesan status
function setMsg(el, text, isError = false) {
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#d63b3b" : "#2563eb";
}

// tombol kembali (inline onclick di HTML butuh global)
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "index.html";
    }
}
window.goBack = goBack;

let originalValues = {
    nama: "",
    email: "",
};

async function loadProfile() {
    try {
        const res = await fetch(API_USER, { credentials: "include" });
        if (!res.ok) {
            window.location.href = "login.html";
            return;
        }

        const result = await res.json();
        if (result.status !== "success" || !result.data) {
            return;
        }

        const data = result.data;

        namaInput.value = data.username || "";
        emailInput.value = data.email || "";

        originalValues = {
            nama: data.username || "",
            email: data.email || "",
        };

        document.querySelector(".profile-name").textContent = data.username || "Pengguna";
        if (photoEl && data.user_profile) {
            currentPhotoUrl = PROFILE_BASE + data.user_profile;
            photoEl.src = currentPhotoUrl;
        }
        clearPhotoSelection();
        clearPasswordInputs(); // bersihkan autofill browser
    } catch (err) {
        console.error("Gagal load profile:", err);
    }
}

function toggleEdit(isEditing) {
    const readonly = !isEditing;
    namaInput.toggleAttribute("readonly", readonly);
    emailInput.toggleAttribute("readonly", readonly);
    if (telpInput) telpInput.toggleAttribute("readonly", readonly);

    editBtn.style.display = isEditing ? "none" : "block";
    saveBtn.style.display = isEditing ? "block" : "none";
    cancelBtn.style.display = isEditing ? "block" : "none";
}

async function saveProfile() {
    const nama = namaInput.value.trim();
    const email = emailInput.value.trim();

    if (!nama || !email) {
        setMsg(profileMsg, "Nama dan email wajib diisi.", true);
        return;
    }

    setMsg(profileMsg, "Menyimpan...");

    const form = new FormData();
    form.append("username", nama);
    form.append("email", email);
    if (telpInput) {
        form.append("telp", telpInput.value.trim());
    }

    try {
        const res = await fetch(API_UPDATE_PROFILE, {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
        setMsg(profileMsg, result.message || "Gagal memperbarui profil.", true);
        return;
    }

    originalValues = { nama, email, telp: telpInput ? telpInput.value.trim() : "" };
    toggleEdit(false);
    setMsg(profileMsg, "Profil berhasil diperbarui.");
    document.querySelector(".profile-name").textContent = nama;
  } catch (err) {
    setMsg(profileMsg, "Error: " + err.message, true);
  }
}

function cancelEdit() {
    namaInput.value = originalValues.nama;
    emailInput.value = originalValues.email;
    if (telpInput) telpInput.value = originalValues.telp || "";

    toggleEdit(false);
    setMsg(profileMsg, "");
}

async function changePassword() {
    const oldPass = oldPassInput.value;
    const newPass = newPassInput.value;
    const confirmPass = confirmPassInput.value;

    if (!oldPass || !newPass || !confirmPass) {
        setMsg(passwordMsg, "Isi semua kolom password.", true);
        return;
    }

    if (newPass !== confirmPass) {
        setMsg(passwordMsg, "Konfirmasi password tidak sama.", true);
        return;
    }

    if (newPass.length < 6) {
        setMsg(passwordMsg, "Password minimal 6 karakter.", true);
        return;
    }

    setMsg(passwordMsg, "Memproses...");

    const form = new FormData();
    form.append("new_password", newPass);
    form.append("old_password", oldPass); // antisipasi jika backend butuh nanti

    try {
        const res = await fetch(API_UPDATE_PASSWORD, {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
            setMsg(passwordMsg, result.message || "Gagal ubah password.", true);
            return;
        }

        oldPassInput.value = "";
        newPassInput.value = "";
        confirmPassInput.value = "";
        setMsg(passwordMsg, "Password berhasil diubah.");
    } catch (err) {
        setMsg(passwordMsg, "Error: " + err.message, true);
    }
}

async function handleLogout() {
    setMsg(dangerMsg, "Logout...");
    try {
        await fetch(API_LOGOUT, { method: "POST", credentials: "include" });
    } catch {}
    window.location.href = "login.html";
}

async function handleDelete() {
    const ok = confirm("Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.");
    if (!ok) return;

    setMsg(dangerMsg, "Menghapus akun...");

    try {
        const res = await fetch(API_DELETE, {
            method: "POST",
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
            setMsg(dangerMsg, result.message || "Gagal menghapus akun.", true);
            return;
        }

        setMsg(dangerMsg, "Akun dihapus. Mengalihkan...");
        setTimeout(() => window.location.href = "login.html", 800);
    } catch (err) {
        setMsg(dangerMsg, "Error: " + err.message, true);
    }
}

function clearPhotoSelection() {
    selectedPhotoFile = null;
    if (photoInput) photoInput.value = "";
    if (removePhotoLink) removePhotoLink.style.display = "none";
    if (savePhotoBtn) savePhotoBtn.style.display = "none";
    if (photoEl && currentPhotoUrl) {
        photoEl.src = currentPhotoUrl;
    }
    setMsg(photoMsg, "");
}

function previewSelectedPhoto(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        setMsg(photoMsg, "Format harus gambar (jpg/png).", true);
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        setMsg(photoMsg, "Ukuran maksimal 2MB.", true);
        return;
    }

    selectedPhotoFile = file;
    const url = URL.createObjectURL(file);
    if (photoEl) {
        photoEl.src = url;
    }
    if (removePhotoLink) removePhotoLink.style.display = "inline-block";
    if (savePhotoBtn) savePhotoBtn.style.display = "inline-block";
    setMsg(photoMsg, "Klik Simpan Foto untuk mengunggah.");
}

async function savePhoto() {
    if (!selectedPhotoFile) {
        setMsg(photoMsg, "Belum ada foto dipilih.", true);
        return;
    }

    setMsg(photoMsg, "Mengunggah...");
    const form = new FormData();
    form.append("profile", selectedPhotoFile);

    try {
        const res = await fetch(API_UPDATE_PHOTO, {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
            setMsg(photoMsg, result.message || "Gagal mengunggah foto.", true);
            return;
        }

        if (photoEl && result.file) {
            currentPhotoUrl = PROFILE_BASE + result.file + "?t=" + Date.now();
            photoEl.src = currentPhotoUrl;
        }
        setMsg(photoMsg, "Foto berhasil disimpan.");
        clearPhotoSelection();
    } catch (err) {
        setMsg(photoMsg, "Error: " + err.message, true);
    }
}

// Jalankan saat halaman dimuat
loadProfile();

editBtn.addEventListener("click", () => toggleEdit(true));
saveBtn.addEventListener("click", saveProfile);
cancelBtn.addEventListener("click", cancelEdit);
changePassBtn.addEventListener("click", changePassword);
logoutBtn.addEventListener("click", handleLogout);
deleteBtn.addEventListener("click", handleDelete);
if (changePhotoLink && photoInput) {
    changePhotoLink.addEventListener("click", (e) => {
        e.preventDefault();
        photoInput.click();
    });
    photoInput.addEventListener("change", (e) => previewSelectedPhoto(e.target.files[0]));
}
if (removePhotoLink) {
    removePhotoLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearPhotoSelection();
    });
}
if (savePhotoBtn) {
    savePhotoBtn.addEventListener("click", savePhoto);
}
