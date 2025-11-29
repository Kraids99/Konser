const submitButton = document.getElementById('submit');

async function getData() {
    const response = await fetch('../api/index.php');
    const data = await response.json();
    console.log(data);
}

async function postData() {
    const response = await fetch('../api/index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'value' })
    });
    const data = await response.json();
    console.log(data);
}

submitButton.addEventListener('click', () => {
    postData();
    getData();
});
