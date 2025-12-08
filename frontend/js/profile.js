import { API, STORAGE } from "./index.js";

const DEFAULT_PROFILE_PHOTO = "./assets/userDefault.png";

let namaInput;
let emailInput;

let editBtn;
let saveBtn;
let cancelBtn;

let changePassBtn;
let logoutBtn;
let deleteBtn;

let oldPassInput;
let newPassInput;
let confirmPassInput;

let profileMsg;
let passwordMsg;
let dangerMsg;
let photoMsg;
let photoInput;
let changePhotoLink;
let removePhotoLink;
let savePhotoBtn;
let nowPhoto;

let selectedPhoto = null;
let currentPhotoUrl = null;

let oriValues = {
    nama: "",
    email: "",
};

window.goBack = goBack;

// FUNCTIONS

// tombol kembali nnti panggil goBack() di html
function goBack() {
    // window history adalah jumlah halaman yang tersimpan di history browser
    if (window.history.length > 1)
        window.history.back();
    else
        window.location.href = "index.html";

}

// cek foto yang dipilih
function cekPhoto(file) {
    if (!file) return;

    // cek tipe harus gambar
    if (!file.type.startsWith("image/")) {
        setMsg(photoMsg, "Format harus gambar (jpg/png).", true);
        return;
    }

    // cek ukuran maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
        setMsg(photoMsg, "Ukuran maksimal 2MB.", true);
        return;
    }

    selectedPhoto = file;

    // Membuat link ke file yang dipilih 
    const url = URL.createObjectURL(file);

    // Mengganti foto profil di halaman menjadi foto yg dipilih
    // .src bawaan image
    if (nowPhoto) nowPhoto.src = url;

    // tombol cancel dan simpan muncul
    // awalnay display none jadi di sini diubah
    if (removePhotoLink) removePhotoLink.style.display = "inline-block";
    if (savePhotoBtn) savePhotoBtn.style.display = "inline-block";
    setMsg(photoMsg, "Klik Simpan Foto untuk mengunggah.");
}

// tombol batal foto
function cancelPhoto() {
    selectedPhoto = null;
    if (photoInput) photoInput.value = "";

    // ilangin tombol cancel dan simpan
    if (removePhotoLink) removePhotoLink.style.display = "none";
    if (savePhotoBtn) savePhotoBtn.style.display = "none";

    // balikin foto ke yang sekarang
    if (nowPhoto && currentPhotoUrl) nowPhoto.src = currentPhotoUrl;

    setMsg(photoMsg, "");
}

// pesan status
function setMsg(el, text, isError = false) {
    if (!el) return;
    el.textContent = text;
    // warnanya merah kalo error, biru kalo bukan
    el.style.color = isError ? "#d63b3b" : "#2563eb";
}

// toggle mode edit profile
function toggleEdit(isEditing) {
    if (!namaInput || !emailInput) return;

    // toggleAttribute(name, force)
    namaInput.toggleAttribute("readonly", !isEditing);
    emailInput.toggleAttribute("readonly", !isEditing);

    // ilangin tombol edit, munculin simpan batal
    editBtn.style.display = isEditing ? "none" : "block";
    saveBtn.style.display = isEditing ? "block" : "none";
    cancelBtn.style.display = isEditing ? "block" : "none";
}

// batal edit profile
function cancelEdit() {
    namaInput.value = oriValues.nama;
    emailInput.value = oriValues.email;

    toggleEdit(false);
    setMsg(profileMsg, "");
}

// bersihin input password
function clearPasswordInputs() {
    // fitur browser yang otomatis mengisi input field
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

// ASYNC FUNCTIONS

// tampilin data profile
async function showProfile() {
    if (!namaInput || !emailInput) return;
    try {
        const res = await fetch(API.USER_SHOW, { credentials: "include" });

        // masuk ke halaman login kalau blm login
        if (!res.ok) {
            window.location.href = "login.html";
            return;
        }

        // cek ada result ga
        const result = await res.json();
        if (result.status !== "success" || !result.data) {
            return;
        }

        // ambil data result
        const data = result.data;

        namaInput.value = data.username || "";
        emailInput.value = data.email || "";

        // kalau misal cancel edit, balikin ke nilai awal
        oriValues = {
            nama: data.username || "",
            email: data.email || "",
        };

        // tampilkan nama di profile header
        document.querySelector(".profile-name").textContent = data.username;

        //  cek ada ga, g ada pakai default
        if (nowPhoto) {
            if (data.user_profile) {
                currentPhotoUrl = STORAGE.PROFILE + data.user_profile;
            } else {
                currentPhotoUrl = DEFAULT_PROFILE_PHOTO;
            }
            nowPhoto.src = currentPhotoUrl;
        }

        cancelPhoto();
        clearPasswordInputs();

    } catch (err) {
        console.error("Gagal ngeload profile:", err);
    }
}

// fungsi simpan foto
async function savePhoto() {
    if (!selectedPhoto) {
        setMsg(photoMsg, "Belum ada foto dipilih.", true);
        return;
    }

    setMsg(photoMsg, "Mengunggah...");
    const form = new FormData();
    form.append("profile", selectedPhoto);

    try {
        const res = await fetch(API.USER_UPDATE_PHOTO, {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
            setMsg(photoMsg, result.message || "Gagal mengunggah foto.", true);
            return;
        }

        if (nowPhoto && result.file) {
            currentPhotoUrl = STORAGE.PROFILE + result.file + "?t=" + Date.now();
            nowPhoto.src = currentPhotoUrl;
        }

        setMsg(photoMsg, "Foto berhasil disimpan.");
        cancelPhoto();
    } catch (err) {
        setMsg(photoMsg, "Error: " + err.message, true);
    }
}


// fungsi simpan profile
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

    try {
        const res = await fetch(API.USER_UPDATE, {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
            setMsg(profileMsg, result.message || "Gagal memperbarui profil.", true);
            return;
        }

        oriValues = {
            nama,
            email,
        };
        toggleEdit(false);
        setMsg(profileMsg, "Profil berhasil diperbarui.");
        document.querySelector(".profile-name").textContent = nama;
    } catch (err) {
        setMsg(profileMsg, "Error: " + err.message, true);
    }
}


// fungsi ganti password
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
    form.append("old_password", oldPass);

    try {
        const res = await fetch(API.USER_UPDATE_PASSWORD, {
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

// fungsi logout
async function handleLogout() {
    setMsg(dangerMsg, "Logout...");
    try {
        await fetch(API.LOGOUT, { method: "POST", credentials: "include" });
    } catch { }
    window.location.href = "login.html";
}

// fungsi hapus akun
async function handleDelete() {
    const ok = confirm("Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.");
    if (!ok) return;

    setMsg(dangerMsg, "Menghapus akun...");

    try {
        const res = await fetch(API.USER_DELETE, {
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


// Jalankan saat halaman dimuat
function profilePage() {
    namaInput = document.getElementById("nama");
    emailInput = document.getElementById("email");

    editBtn = document.getElementById("editBtn");
    saveBtn = document.getElementById("saveBtn");
    cancelBtn = document.getElementById("cancelBtn");

    changePassBtn = document.querySelector(".change-password-btn");
    logoutBtn = document.querySelector(".logout-btn");
    deleteBtn = document.querySelector(".delete-btn");

    oldPassInput = document.getElementById("oldPass");
    newPassInput = document.getElementById("newPass");
    confirmPassInput = document.getElementById("confirmPass");

    profileMsg = document.getElementById("profileMsg");
    passwordMsg = document.getElementById("passwordMsg");
    dangerMsg = document.getElementById("dangerMsg");
    photoMsg = document.getElementById("photoMsg");
    photoInput = document.getElementById("photoInput");
    changePhotoLink = document.querySelector(".change-photo");
    removePhotoLink = document.querySelector(".remove-photo");
    savePhotoBtn = document.getElementById("savePhotoBtn");
    nowPhoto = document.querySelector(".profile-photo");

    if (!editBtn || !saveBtn || !cancelBtn) {
        console.warn("Elemen profil tidak lengkap, inisialisasi dilewati.");
        return;
    }

    showProfile();

    editBtn.addEventListener("click", () => toggleEdit(true));
    saveBtn.addEventListener("click", saveProfile);
    cancelBtn.addEventListener("click", cancelEdit);
    changePassBtn?.addEventListener("click", changePassword);
    logoutBtn?.addEventListener("click", handleLogout);
    deleteBtn?.addEventListener("click", handleDelete);

    // button ganti foto dan input filenya ada ga?
    if (changePhotoLink && photoInput) {
        changePhotoLink.addEventListener("click", (e) => {
            e.preventDefault();
            // klik link ganti foto
            photoInput.click();
        });
        photoInput.addEventListener("change", (e) => cekPhoto(e.target.files[0]));
    }

    // kalau cancel ga reload bistu cancelPhoto();
    if (removePhotoLink) {
        removePhotoLink.addEventListener("click", (e) => {
            e.preventDefault();
            cancelPhoto();
        });
    }
    
    // klo foto simpan diklik panggil savePhoto()
    if (savePhotoBtn) {
        savePhotoBtn.addEventListener("click", savePhoto);
    }
}

document.addEventListener("DOMContentLoaded", profilePage);