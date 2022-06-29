var loadedChats = []
var connectedChats = []
var chatsData = {}
var lastFocus = null

function loadChats(_roomList,mode=0) {
    loadedChats = []
    let x,y,z
    chatsData = JSON.parse(postUrlencoded(origin+'/chatrooms').responseText)
    _roomList.innerHTML = ''
    for(let i in chatsData) {
        z = `${origin}/chat/${i}/`
        if(mode==1) z = `javascript:focusChat("${i}")`
        x = document.createElement('a')
        x.classList.add('flex-center')
        x.classList.add('room-item')
        y = document.createElement('div')
        y.classList.add('room-item-signal')
        if(true) {
            y.classList.add('signal-on')
            x.href = z
            x.classList.add('active-room-item')
        }
        else {
            y.classList.add('signal-off')
            x.classList.add('inactive-room-item')
        }
        x.appendChild(y)
        y = document.createElement('div')
        y.classList.add('room-item-name')
        y.innerText = chatsData[i]['name']
        x.appendChild(y)
        y = document.createElement('div')
        y.classList.add('room-item-code')
        y.innerText = i
        x.appendChild(y)
        x.id = `nav_${i}`
        _roomList.appendChild(x)
        loadedChats.push(i)
    }
}

function chats_loadChats(_roomList) {
    connectedChats = []
    chatFrame.innerHTML = ''
    lastFocus = null
    loadChats(_roomList,1)
    focusChat(loadedChats[0])
    for(let i=1;i<loadedChats.length;i++) {
        connectChat(loadedChats[i])
    }
}

function focusChat(code) {
    if (lastFocus==code) return 0
    if(connectedChats.indexOf(code)==-1) connectChat(code)
    document.getElementById(code).classList.remove('hide')
    document.getElementById(`nav_${code}`).classList.add('onview')
    try {
        document.getElementById(lastFocus).classList.add('hide')
        document.getElementById(`nav_${lastFocus}`).classList.remove('onview')
        document.getElementById(code).getElementsByTagName('iframe')[0].contentWindow.viewPage()
    }
    catch(e) {}
    lastFocus = code
}

function connectChat(code) {
    let z = document.createElement('div') // parent
    z.classList.add('hide')
    z.id = code
    let y = document.createElement('div')
    y.classList.add('chat-frame')
    y.classList.add('flex-center')
    y.id = `loading_${code}`
    y.innerText = 'Loading...'
    y.style = 'background-color: rgb(25, 30, 30);'
    z.appendChild(y)
    let x = document.createElement('iframe')
    x.classList.add('chat-frame')
    x.classList.add('flex-center')
    x.classList.add('hide')
    x.src = `${origin}/chat/${code}/?embed=1`
    z.appendChild(x)
    chatFrame.appendChild(z)
    x.onload = function(){
        y.parentNode.removeChild(y)
        x.classList.remove('hide')
    }
    connectedChats.push(code)
}