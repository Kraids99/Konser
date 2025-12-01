const namaInput = document.getElementById("nama");
const emailInput = document.getElementById("email");
const telpInput = document.getElementById("telp");

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

let originalValues = {
    nama: namaInput.value,
    email: emailInput.value,
    telp: telpInput.value
};

editBtn.addEventListener("click", () => {
    namaInput.removeAttribute("readonly");
    emailInput.removeAttribute("readonly");
    telpInput.removeAttribute("readonly");

    editBtn.style.display = "none";
    saveBtn.style.display = "block";
    cancelBtn.style.display = "block";

    namaInput.focus();
});

saveBtn.addEventListener("click", () => {
    originalValues = {
        nama: namaInput.value,
        email: emailInput.value,
        telp: telpInput.value
    };

    namaInput.setAttribute("readonly", true);
    emailInput.setAttribute("readonly", true);
    telpInput.setAttribute("readonly", true);

    editBtn.style.display = "block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";

    alert("Perubahan berhasil disimpan!");
});

cancelBtn.addEventListener("click", () => {
    namaInput.value = originalValues.nama;
    emailInput.value = originalValues.email;
    telpInput.value = originalValues.telp;

    namaInput.setAttribute("readonly", true);
    emailInput.setAttribute("readonly", true);
    telpInput.setAttribute("readonly", true);

    editBtn.style.display = "block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
});

function goBack() {
    if (document.referrer) {
        history.back();
    } else {
        window.location.href = "dashboard.html";
    }
}
