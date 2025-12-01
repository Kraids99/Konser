function enableEdit() {
    document.getElementById('nama').disabled = false;
    document.getElementById('email').disabled = false;
    document.getElementById('telp').disabled = false;
    document.getElementById('saveBtn').style.display = 'inline-block';
}
function saveChanges() {
    // AJAX ke backend di sini
    alert('Perubahan disimpan!');
    document.getElementById('nama').disabled = true;
    document.getElementById('email').disabled = true;
    document.getElementById('telp').disabled = true;
    document.getElementById('saveBtn').style.display = 'none';
}

// ----------------------------------------------
// 1. FETCH DATA USER LOGIN
// ----------------------------------------------
fetch('/api/controllers/UserController.php?action=show')
    .then(res => res.json())
    .then(res => {
        console.log("RESPON API:", res);

        if (res.status !== 'success') {
            alert('Gagal mengambil data user!');
            return;
        }

        const u = res.data;

        document.querySelector(".name").textContent = u.username;
        document.querySelector(".email").textContent = u.email;

        if (u.user_profile) {
            document.querySelector(".avatar").style.background =
                `url('/api/storage/profile/${u.user_profile}') center/cover no-repeat`;
        }

        document.getElementById("nama").value = u.username;
        document.getElementById("email").value = u.email;
        document.getElementById("telp").value = u.telp ?? "";
    })
    .catch(err => console.error("FETCH ERROR:", err));

// ----------------------------------------------
// 2. ENABLE EDIT MODE
// ----------------------------------------------
function enableEdit() {
    document.getElementById('nama').disabled = false;
    document.getElementById('email').disabled = false;
    document.getElementById('telp').disabled = false;

    document.getElementById('saveBtn').style.display = 'inline-block';
}

// ----------------------------------------------
// 3. SIMPAN PERUBAHAN KE BACKEND
// ----------------------------------------------
function saveChanges() {
    let formData = new FormData();
    formData.append("username", document.getElementById("nama").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("telp", document.getElementById("telp").value);

    fetch('../controller/user.php?action=updateProfile', {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(res => {
            if (res.status === "success") {
                alert("Perubahan berhasil disimpan!");

                // kunci input lagi
                document.getElementById('nama').disabled = true;
                document.getElementById('email').disabled = true;
                document.getElementById('telp').disabled = true;
                document.getElementById('saveBtn').style.display = 'none';
            } else {
                alert(res.message);
            }
        });
}
