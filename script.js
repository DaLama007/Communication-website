
function submit() {
    let chatbox = document.getElementById('chat-box');
    let user_input = document.getElementById('msginput');
    const user_message = user_input.value.trim();
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.textContent = user_message;
    chatbox.appendChild(msg)
    console.log(user_message)
    user_input.value = ''
}   
document.getElementById('msginput').addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        submit();
    }
})

document.getElementById('logout-button').addEventListener('click', (event) => {
    localStorage.setItem('isLoggedIn', 'false')
})
if (localStorage.getItem('isLoggedIn') == 'true') {
    document.getElementById('login-pagebutton').style.display = 'none';
    document.getElementById('signup-pagebutton').style.display = 'none';
    document.getElementById('logout-button').style.display = 'inline';
}
else {
    document.getElementById('login-pagebutton').style.display = 'inline';
    document.getElementById('signup-pagebutton').style.display = 'inline';
    document.getElementById('logout-button').style.display = 'none';
}

