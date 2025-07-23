document.getElementById('login-button').addEventListener('click', (event) => {

    let usernameInput = document.getElementById('usernameInput').value.trim();
    let passwordInput = document.getElementById('passwordInput').value.trim();
    fetch('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify({ usernameInput, passwordInput }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data=>{
        if(data.success){
            localStorage.setItem('username', usernameInput)
            localStorage.setItem('isLoggedIn', 'true')
            window.location.href = "index.html";
            console.log('user')
        }
        else{
            console.log('False Username/password')
        }

    })
    
})