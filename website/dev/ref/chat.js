var userdict = {}
var isPhone = window.screen.width < 500
var namespace
var chatroom_path
var isViewed = false

function sendMsg() {
    let msg_text = document.getElementById('message-input').innerText.trim()
    if (msg_text!='') {
        $('#message-input').focus()
        socket.send(JSON.stringify({
            'event':'message',
            "type":"none",
            'user':userInfo,
            'content':msg_text,
        }))
        $('#message-input').html('')
    }

    if (Object.keys(uploadItemList).length > 0) {
        let form = new FormData()
        let j = 0
        for(let i in uploadItemList) {
            form.append(j++,uploadItemList[i].file)
            fileUploadList.removeChild(uploadItemList[i].btn)
        }
        let x = new XMLHttpRequest(), y = new Popup({plugin:'uploading'})
        x.open('post',origin+'/upload',true)
        x.onload = function() {
            y.remove(y.frame)
        }
        form.append('user',JSON.stringify(userInfo))
        form.append('namespace',namespace)
        x.upload.onprogress = function(e) {
            y.progress.value = e.loaded
            y.progress.max = e.total
        }
        x.upload.onloadend = function() {
            y.text.innerText = 'Sending'
        }
        x.send(form)
        uploadItemList = {}
        inputHeightCheck()
    }

    return false
}

function viewPage() {
    if (!isViewed) {
        inputHeightCheck()
        isViewed = scrollToBottom()
    }
    document.getElementById('message-input').focus()
}

function scrollToBottom(v=false) {
    if (!v) v = $('#msgBox').outerHeight()
    $('#view').scrollTop($('#view').scrollTop()+v)
    return v
}

function loadHistory(code) {
    try {
        document.getElementById('message-start').innerText = 'Loading...'
        let x = postUrlencoded(origin+'/history','chatroom='+code,true)
        x.onload = function() {
            let d = x.responseText.split('\n')
            document.getElementById('message-start').innerText = 'New chat!'
            for(let i=0;i<d.length;i++) {
                if(d[i]!='') {
                    try {
                        addMessageItem({"data":JSON.parse(d[i])},'messageList-old')
                    }
                    catch(e) {}
                }
            }
            viewPage()
        }
    }
    catch(e) {
        setTimeout(loadHistory,100,code)
    }
}

function userSetting() {
    if(confirm('Do you want to log out?')) {
        logout()
    }
}

function urlify(content,tagname='span') { /* return a element */
    let reg = /((https?|ftp|file):\/\/)?([-A-Z0-9\.]{2,256}\.)?[-A-Z0-9]{2,256}\.[A-Z]{2,6}(\/[-A-Z0-9+&@#/%?=~_|!.,:;\u0250-\uffff]{1,})?\/?(?!\w|\S)/gi
    let i,j,_urlify_links = {}
    try {
        content.replace(reg, function (match) {
            let href = match
            if (match.indexOf("http") == -1) href = 'https://' + match
            i = href.substring(8)
            j = i.indexOf('/')
            if (j == -1) j = i.length
            if ( i.substring(0,j).split('.').length < 5) _urlify_links[match] = href
            return match
        })
    }
    catch(e){}
    let k = '',x,y = document.createElement(tagname),z = false
    for (i=0; i<content.length; i++) {
        if (!z) z = true
        for (j in _urlify_links) {
            if(j==content.substring(i,i+j.length)) {
                if (k!='') {
                    x = document.createElement('span')
                    x.innerText = k
                    y.appendChild(x)
                    k = ''
                }
                x = document.createElement('a')
                x.title = ""
                x.target = "_blank"
                x.innerText = j
                x.href = _urlify_links[j]
                y.appendChild(x)
                i += j.length - 1
                z = false
                break
            }
        }
        if (z) k += content[i]
    }
    if (k!='') {
        x = document.createElement('span')
        x.innerText = k
        y.appendChild(x)
        k = ''
    }
    return y
}

function file_url(filename,sc_code) {
    return `/static/upload/${chatroom_path}/${sc_code}/${filename}`
}

function file_dl(filename,sc_code) {
    return dl_file_downlaod(filename,file_url(filename,sc_code))
}

function addMessageInfo(text,tt='',l='messageList') {
    let y = document.createElement('div')
    y.classList = 'message-info'
    y.title = tt
    y.innerText = text
    document.getElementById(l).appendChild(y)
    return y
}

var lastTimetag = 0
var hideCombo = 0
function addMessageItem(d,l='messageList',order=1) {
    d = d['data']
    let t = fmtDate_auto_py(d['t']),y
    y = d['type'].split('/')
    d['type'] = y[0]
    d['format'] = y[1]
    url = file_url(d['name'],d['content'])
    if(!(d['uid'] in userdict)) {
        y = postUrlencoded(origin+'/user','data='+d['uid'], false)
        y = JSON.parse(y.responseText)
        userdict[d['uid']] = y['username']
    }
    if(d['t']-lastTimetag<5*60 && hideCombo<64) {
        hideCombo++
    }
    else {
        addMessageInfo(t,fmtDate_std_py(d['t']),l)
        hideCombo = 0
    }
    lastTimetag = d['t']

    // 建造物件
    let x = document.createElement('div'), smallContainer = false
    x.title = fmtDate_auto_py(d['t'],true)
    x.classList.add('messageItem')
    y = document.createElement('div')
    y.classList.add('userInfo')
    y.innerHTML = '<a class="msg-username">'+userdict[d['uid']]+'</a>'
    x.appendChild(y)
    if (d['type'] == 'none') {
        y = urlify(d['content'],'div')
        y.classList.add('message-text')
    }
    else {
        smallContainer = true
        switch (d['type']) { // 内容
            case 'image':
                y = document.createElement('img')
                y.setAttribute('onclick',`new Popup({plugin:'image-viewer',plugin_param:this})`)
                y.style = 'cursor:pointer;'
                break;
            case 'video':
                y = document.createElement('video')
                break;
            case 'audio':
                y = document.createElement('audio')
                break;
            case 'application':
            case 'text':
                y = [document.createElement('a')]
                y[0].href = url
                y[0].target = '_blank'
                y.push(document.createElement('div'))
                y[1].innerText = d['name']
                y[1].classList.add('message-file-name')
                y.push(document.createElement('div'))
                y[2].innerText = fileSizeStr(d['size'])
                y[2].classList.add('message-file-size')
                y.push(document.createElement('div'))
                y[3].classList.add('message-file-info')
                y[3].appendChild(y[1])
                y[3].appendChild(y[2])
                y.push(document.createElement('a'))
                y[4].href = `javascript:file_dl("${d['name']}","${d['content']}")`
                y[4].classList.add('message-file-dl-btn')
                y[4].title = 'Download'
                y[0].appendChild(y[3])
                y[0].appendChild(y[4])
                y = y[0]
                y.classList.add('flex-center')
                y.classList.add('message-file')
                break;
            case 'embed-yt':
                y = document.createElement('iframe')
                y.src = `https://www.youtube.com/embed/${d['content']}`
                y.classList.add('iframe-embed-youtube')
                y.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                y.allowFullscreen = true
                smallContainer = false
                break;
            default:
                y = document.createElement('em')
                y.classList.add('message-text')
                y.classList.add('message-removed')
                if (d['type']=='removed') y.innerText = 'The message has been removed.'
                else y.innerText = 'Message error.'
                smallContainer = false
                break;
        }
        if (['image','video','audio'].indexOf(d['type'])>-1) {
            y.src = url
            y.alt = d['name']
            y.classList.add('message-media')
            if (['audio','video'].indexOf(d['type'])>-1) {
                y.setAttribute('oncanplay',`scrollToBottom(this.offsetHeight)`)
                y.controls = true
            }
            else y.setAttribute('onload',`scrollToBottom(this.offsetHeight)`)
        }
    }
    x.appendChild(y)
    y = document.createElement('div')
    y.classList.add('messageItem-container')
    if(smallContainer) y.classList.add('messageItem-container-small')
    if(d['uid']==userInfo['uid']) {
        y.classList.add('myMessage')
    }
    y.appendChild(x)
    if(order==1) document.getElementById(l).appendChild(y)
    else {
        l = document.getElementById(l)
        l.insertBefore(y.l.childNodes[0])
    }
    return d
}

function isEmbed() {
    let x = parseUrlParams()
    if(x['embed']=='1') {
        document.getElementById('chatroom-code').classList.add('hide')
        document.getElementById('header-username').classList.add('hide')
        document.getElementById('header-roomname-container').style = 'justify-content:center;'
        document.getElementById('header-roomname').href = `${origin}/chat/${namespace}`
        document.getElementById('header-roomname').target = '_blank'
    }
}

var fileUploadList // HTML element
var uploadItemList = {}
var uploadCount = 0

function newUploadItem(f) {
    let x = `${(new Date).getTime()}-${uploadCount++}`
    uploadItemList[x] = new UploadItem(f,x)
}

class UploadItem {
    constructor(f,i) {
        let x = document.createElement('li')
        x.id = i
        let y = document.createElement('span')
        y.innerText = f.name
        x.appendChild(y)
        y = document.createElement('img')
        y.classList.add('btn')
        y.setAttribute('onclick',`del_file("${i}")`)
        y.src = '/static/icons/close.png'
        y.alt = 'del'
        y.draggable = false
        x.appendChild(y)
        fileUploadList.appendChild(x)
        this.file = f
        this.btn = x
    }
}

function uploadFile() {
    document.getElementById('file-upload').click()
}

function del_file(i) {
    let x = uploadItemList[i].btn
    delete  uploadItemList[i]
    x.parentNode.removeChild(x)
    inputHeightCheck()
}

window.onload = function() {
    fileUploadList = document.getElementById('file-upload-list')
    namespace = document.getElementById('chatroom-code').innerText
    chatroom_path = document.getElementById('chatroom-path').innerText

    userdict[userInfo['uid']] = userInfo['username']
    setTimeout(loadHistory,0,namespace)
    socket.on('message',function(d) {
        switch (d['cmd']) {
            case 'chat-message':
                addMessageItem(d)
                if(title_onflashing) title_flashing()
                break
            case 'chat-prompt':
                let text = ''
                switch (d['data']['event']) {
                    case 'connect':
                        if (d['data']['user']['session']==userInfo['session']) text = 'You joined the chat.'
                        else text = `${d['data']['user']['username']} has joined.`
                        break
                    case 'disconnect':
                        if (d['data']['user']['session']==userInfo['session']) text = 'You left the chat.'
                        else text = `${d['data']['user']['username']} has left.`
                        break
                    default:
                        break
                }
                addMessageInfo(text,fmtDate_auto(false,true))
                break
            case 'roolcall':
                socket.send(JSON.stringify({
                    'event':'rollcall',
                    'user':userInfo
                }))
                break
            default:
                console.log('Invalid command:',d);
                return 1
        }
        scrollToBottom()
        return 0
    })

    let x = '/chats'
    if(isPhone) x = '/chatroom-list'
    document.getElementById('header-back').href = origin + x
    isEmbed()

    $('#message-input').attr({
        "onkeydown":"inputKeyDetect(event.key)",
        "onpropertychange":"inputHeightCheck(event.key)",
        "oninput":"inputHeightCheck(this)"
    })
    
    $('#file-upload').change(function() {
        f = this.files
        let x
        for(let i = 0; i < f.length; i ++ ) {
            newUploadItem(f[i])
        }
        inputHeightCheck()
    })

    document.getElementById('message-input').addEventListener('paste',function(e) {
        e.preventDefault();
        // Get the copied text from the clipboard
        const text = e.clipboardData
            ? (e.originalEvent || e).clipboardData.getData('text/plain')
            : // For IE
            window.clipboardData
            ? window.clipboardData.getData('Text')
            : '';
    
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        } else {
            // Insert text at the current position of caret
            const range = document.getSelection().getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.selectNodeContents(textNode);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        let cbd = e.clipboardData
        if (!(cbd && cbd.items)) return 0
        for(let i = 0; i < cbd.items.length; i++) {
            if(cbd.items[i].kind == "file") {
                newUploadItem(cbd.items[i].getAsFile())
            }
        }
        // 产生预览图片
        // var reader = new FileReader()
        // var imgs = new Image()
        // imgs.file = blob
        // reader.onload = (function(aImg) {
        //     return function(e) {
        //     aImg.src = e.target.result
        //     }
        // })(imgs)
        // reader.readAsDataURL(blob)
        // document.querySelector('#editDiv').appendChild(imgs)
        
        inputHeightCheck()
    })

}

function inputKeyDetect(k) {
    if(k=="Enter"&&!window.event.shiftKey&&!isPhone) sendMsg()
}

function inputHeightCheck(x=false) {
    if(x) if(x.innerText.trim()=='') x.innerText = ''
    document.body.style.setProperty('--inputBoxH',$('#inputBox').outerHeight()+'px')
    return 0
}

var page_title = document.title
var title_onflashing = true

window.onfocus = function() {
    title_onflashing = false
    document.title = page_title
}

window.onblur = function() {
    title_onflashing = true
}

function title_flashing(_n=true) {
    if(!title_onflashing||!isPhone) return 0
    if(_n) document.title = "New message!"
    else document.title = page_title
    _n = !_n
    setTimeout(title_flashing,1000,_n)
}
