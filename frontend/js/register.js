const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');
const endpoint = '../api/index.php?action=register';

async function register(e) {
    // biar ga reload"
    e.preventDefault();

    // bikin body POST dengan format "key=value"
    // const data = new URLSearchParams();
    // data.append('username', form.username.value); // append menambah pasangan key/value ke body
    // data.append('email', form.email.value);
    // data.append('password', form.password.value);

    // FormData otomatis ambil semua input dari form berdasarkan name=""
    // const data = new FormData(form);

    const data = new FormData();
    data.append('username', username.value);
    data.append('email', email.value);
    data.append('password', password.value);

    try {
        // const res = await fetch(endpoint, {
        //     method: 'POST',
        //     headers: {
        //         // headers itu isinya tipe data body yang dikirim; di sini x-www-form-urlencoded cocok dengan URLSearchParams
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     // kirim body dalam bentuk string karan USP bkn bentuk string
        //     body: data.toString(), 
        // });

        const res = await fetch(endpoint, {
            method: 'POST',
            body: data // TIDAK perlu set Content-Type
        });

        const result = await res.json();

        if (res.ok) {
            alert('Registration successful!');
            msg.textContent = '';
            // ke halaman login setelah berhasil daftar
            window.location.href = './login.html';
        }
        else {
            msg.textContent = 'Registration failed: ' + (result.message || 'unknown error');
        }
    }
    catch (err) {
        msg.textContent = 'Request gagal: ' + err.message;
    }
}

// kalau tekan submit bakalan jalanin fungsi register
form.addEventListener('submit', register);


// apabila tidak menggunakan URLSearchParams pakai contoh kode dibawah ini
// Note: harus satu" ambil datanya

// const payload = {
//   username: form.username.value,
//   email: form.email.value,
//   password: form.password.value,
// };

// fetch(endpoint, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(payload),
// });

