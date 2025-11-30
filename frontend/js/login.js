const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const endpoint = '../api/index.php?action=login';

async function login(e) {
    e.preventDefault(); // supaya tidak reload halaman

    // FormData membentuk body multipart, tinggal append field sesuai name input
    const data = new FormData();
    data.append('email', form.email.value.trim());
    data.append('password', form.password.value);
    if(form.remember?.checked) 
    {
        data.append('remember', '1'); // 1 artinya aktifkan remember me
    }

    msg.textContent = 'Submitting...';

    try 
    {
        const res = await fetch(endpoint, {
            method: 'POST',
            body: data,          // jangan set Content-Type; browser yang isi boundary
            credentials: 'include' // penting supaya cookie/sesi tersimpan
        });

        const result = await res.json();

        if(res.ok) 
        {
            msg.textContent = 'Login berhasil!';
            // ke halaman utama setelah berhasil daftar
            window.location.href = './index.html';
        } 
        else 
        {
            msg.textContent = 'Login gagal: ' + (result.message || 'unknown error');
        }
    } 
    catch (err) 
    {
        msg.textContent = 'Request gagal: ' + err.message;
    }
}

form.addEventListener('submit', login);

