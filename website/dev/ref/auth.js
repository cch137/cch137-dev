/*\
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|  Syntaxes:
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
        switch (vEnd.constructor) {
            case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
            case String:
            sExpires = "; expires=" + vEnd;
            break;
            case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
}

var userInfo = {}
var debug = false
var origin = document.location.origin
var path = origin + document.location.pathname

function postUrlencoded(url,msg='',asyncRequest=false) { // false 同步，true 异步
    let x = new XMLHttpRequest()
    x.open('POST', url, asyncRequest)
    x.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8")
    x.send(msg)
    return x
}

function login() {
    let x = postUrlencoded(`${origin}/login`)
    x = JSON.parse(x.responseText)
    if (['login-success','login-resume'].indexOf(x['state'])==-1) {
        logout()
    }
    userInfo['username'] = x['user']['username']
    debug = x['debug']
}
if(['/logout','/login'].indexOf(document.location.pathname)==-1) login()

function logout(x=true,y=true) {
    if(x) docCookies.removeItem('session','/')
    if(y) document.location = origin+'/login'
}

function parseUrlParams() {
    let i,x = document.location.search.substring(1).split('&'),y={}
    for (i=0;i<x.length;i++) {
        x[i] = [x[i].substring(0,x[i].indexOf('=')),x[i].substring(x[i].indexOf('=')+1)]
        y[x[i][0]] = decodeURI(x[i][1])
    }
    return y
}

// function getUserIP() {
//     let conn = new RTCPeerConnection({iceServers:[]})
//     let noop = function(){}
//     conn.onicecandidate = function(ice){
//         if (ice.candidate) {
//             let ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
//             userData['ipAddress'] = ip_regex.exec(ice.candidate.candidate)[1];
//             conn.onicecandidate = noop
//         }
//     }
//     conn.createDataChannel('temp')
//     conn.createOffer(conn.setLocalDescription.bind(conn),noop)
//     return userData['ipAddress']
// }
function getIP() {
    $.ajaxSettings.async = false
    $.get('https://www.cloudflare.com/cdn-cgi/trace', function(d) {
        d = d.trim().split('\n').reduce(function(obj, pair) {
            pair = pair.split('=');
            return obj[pair[0]] = pair[1], obj;
        }, {})
        userInfo['ip'] = d['ip']
        userInfo['loc'] = d['loc']
    })
    $.ajaxSettings.async = true
}

function load_script(s){
    let x = document.createElement('script')
    x.src = s
    document.head.appendChild(x)
    return x
}

function update_user() {
    getIP()
    postUrlencoded(origin+'/update',msg='user='+JSON.stringify(userInfo),true)
}

userInfo['session'] = docCookies.getItem('session')
userInfo['uid'] = postUrlencoded(origin+'/uid','data='+userInfo['username'],false).responseText
update_user()
setInterval(update_user,5*60*1000)

function socketEvent(x) {
    socket.send(JSON.stringify({
        'event':x,
        'user':userInfo
    }))
}

var socket = io.connect(path)

var disconnected = false
socket.on('connect',function() {
    if (disconnected && debug) document.location = document.location
    socketEvent('connect')
})

socket.on('disconnect',function() {
    socketEvent('disconnect')
    disconnected = true
})

window.onbeforeunload = function() {
    socketEvent('disconnect')
}

{
    let x = document.createElement('script')
    x.src = '/static/scripts/popup.js'
    document.head.appendChild(x)
}