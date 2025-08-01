/*const socket=io('http://localhost:3000')
//on method
socket.on('welcome', data=>{
    //emit data
    console.log(data)
    socket.emit('thankYou', [4,5,6])

    
})*/
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
    user_input.value = ''
}

function displayError(errorMessage){
    errorMessage = errorMessage.trim();
    commandOutput = document.getElementById('command-output');
    const response = document.createElement('div');
    response.innerHTML =`${errorMessage}`
    commandOutput.appendChild(response);

}
function submitComm() {
    command = document.getElementById('command-input').value.trim();
    commandOutput = document.getElementById('command-output');
    const response = document.createElement('div');
    response.classList.add('message');
    splitCommand=command.split(' ')
    if (command != '' && command!='clear') {
        if (command == 'help') {
            response.innerHTML = `<span>-ls: Show latest conversations</span><br></br><span>-cd [username]: Set current conversation</span><br></br><span>-mkdir [username]: Start new conversation with user</span><br></br>`;
        }
        else if(splitCommand[0]=='mkdir'){
            otherUser=splitCommand[1];
            creatNewRoom(otherUser);
            loadMessages(otherUser);
        }
        else if(splitCommand[0]=='cd'){
            otherUser=splitCommand[1];
            loadMessages(otherUser);
        }
        else {
            response.textContent = 'bash: command_name: command not found';
        }
        commandOutput.appendChild(response);
        console.log(response);
        
    }
    else if(command=='clear'){
        commandOutput.innerHTML='';
    }
    document.getElementById('command-input').value = '';
}

document.getElementById('msginput').addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        submit();
    }
})
document.getElementById('command-input').addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        submitComm();
    }
})

document.getElementById('logout-button').addEventListener('click', (event) => {
    localStorage.setItem('isLoggedIn', 'false')
    localStorage.setItem('username', '')
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
function loadMessages(otherUser) {
    const user1 = localStorage.getItem('username');
    const user2 = otherUser;
    return fetch('http://localhost:3000/set-Room', {
        method: 'POST',
        body: JSON.stringify({username:user1,otherUser:user2}),
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
                displayError('Messages could\'t be fetched.')
            }

        })
}
function creatNewRoom(otherUser){
    const user1 = localStorage.getItem('username');
    const user2 = otherUser;
    return fetch('http://localhost:3000/create-newRoom', {
        method: 'POST',
        body: JSON.stringify({username:user1,otherUser:user2}),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {

            }
            else {
                displayError('New room couldn\'t be created.')
            }
        })
}
/*function onStart() {
    loadMessages().then(() => {
        let chatbox = document.getElementById('chat-box');
        chatbox.scrollTop = chatbox.scrollHeight;
    });
}
onStart();
setInterval(loadMessages, 1000);*/