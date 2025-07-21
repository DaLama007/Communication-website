
document.getElementById('login-button').addEventListener('click', (event)=>{
    let username=document.getElementById('usernameInput').value.trim();
    let password=document.getElementById('passwordInput').value.trim();

    if(username=='u' && password=='p'){
        
        localStorage.setItem('isLoggedIn','true')
        window.location.href = "index.html";
        
    }
})