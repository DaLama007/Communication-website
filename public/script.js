function submit() {
    let chatbox = document.getElementById('chat-box');
    let user_input = document.getElementById('msginput');
    const user_message = user_input.value.trim();
    const msg = document.createElement('div');
    let user = localStorage.getItem('username');
    msg.classList.add('message');
    if (user) {
        msg.textContent = user_message;
        fetch('http://localhost:3000/global', {
            method: 'POST',
            body: JSON.stringify({ username: user, content: user_message }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                }
                else {
                    console.log('failed to load messages')
                }

            })
    }
    else {
        msg.textContent = 'Log in or Create account to message your friends :)'
    }
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
    localStorage.set('username', '')
})
if (localStorage.getItem('isLoggedIn') == 'true') {
    document.getElementById('login-pagebutton').style.display = 'none';
    document.getElementById('signup-pagebutton').style.display = 'none';
    document.getElementById('logout-button').style.display = 'inline';
    let chatbox = document.getElementById('chat-box');
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.textContent = 'Hello /Users/' + localStorage.getItem('username');
    chatbox.appendChild(msg)
}
else {
    document.getElementById('login-pagebutton').style.display = 'inline';
    document.getElementById('signup-pagebutton').style.display = 'inline';
    document.getElementById('logout-button').style.display = 'none';
}
function loadMessages() {
    return fetch('http://localhost:3000/get-global', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                let chatbox = document.getElementById('chat-box');

                chatbox.innerHTML = ""
                const messages = data
                data.messages.forEach(message => {
                    const msg = document.createElement('div');
                    let timeData = message.timestamp.split(' ');
                    let date = timeData[0]
                    let time = timeData[1]
                    time = time.slice(0, 5)
                    msg.classList.add('message');
                    msg.innerHTML = `<span class="sender">${message.username}</span>: ${message.content} <span class="timestamp">[${time}]</span>`;
                    chatbox.appendChild(msg)
                });


            }
            else {
                console.log('Error')
            }

        })
}
function onStart() {
    loadMessages().then(() => {
        let chatbox = document.getElementById('chat-box');
        chatbox.scrollTop = chatbox.scrollHeight;
    });
}
onStart();
setInterval(loadMessages, 1000);