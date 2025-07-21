let loggedIn=false
function submit() {
    let chatbox=document.getElementById('chat-box');
    let user_input=document.getElementById('msginput');
    const user_message = user_input.value.trim();
    const msg=document.createElement('div');
    msg.classList.add('message');
    msg.textContent=user_message;
    chatbox.appendChild(msg)
    console.log(user_message)
    user_input.value=''
}
document.getElementById('msginput').addEventListener('keypress', (event)=>{
    if (event.key=='Enter'){
        submit();
    }
    })
    
    
