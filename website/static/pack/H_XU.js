function __URL_PARAMS() {
    const x = {}
    for (let i of document.location.search.substring(1).split('&')) {
            i = [i.substring(0,i.indexOf('=')),i.substring(i.indexOf('=')+1)]
            x[i[0]] = decodeURI(i[1])
        }
    return x
}

class URL_PARAMS{
    constructor() {
        this.params = __URL_PARAMS()
    }

    load() {
        this.params = __URL_PARAMS()
    }
    
    get(k) {
        return this.params[k]
    }
    
    set(k,v) {
        this.params[k] = v
    }

    string() {
        let p = []
        for (const i in this.params) {
            if(this.params[i]) {
                p.push(`${i}=${this.params[i]}`)
            }
        }
        p = p.join('&')
        if (p) {
            p = `?${p}`
        }
        return p
    }

    href() {
        return `${window.location.origin}${window.location.pathname}${this.string()}`
    }

    isSafeUrl(url) {
        if (encodeURI(url.length) > 4096) {
            return false
        }
        return true
    }

    pushState(safe=true) {
        const p = this.href()
        if (safe) {
            if (!this.isSafeUrl(p)) {
                return 0
            }
        }
        history.pushState(0,0,p)
    }

    replaceState(safe=true) {
        const p = this.href()
        if (safe) {
            if (!this.isSafeUrl(p)) {
                return 0
            }
        }
        history.replaceState(0,0,p)
    }
    
    runWhenPopstate(f) {
        window.onpopstate = f
    }
    
    reloadWhenPopstate(b=true) {
        this.runWhenPopstate(function() {
            document.location = document.location
        })
    }
}
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

const DocCookies = {
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
const Page = {
    appName: document.title,
    container: null,
    current_tabname: '',
    nav: {
        collection: {}
    },
    tabs: {
        collection: {},
        index: {},
        isRendered: {},
        scrolled: {},
        list: null,
        view: null,
        to: function(tn) {
            const tabname = tn
            const last = Page.current_tabname || tabname
            if (tabname == Page.current_tabname && last) {
                return 0
            }
            Page.current_tabname = tabname
            // 设置物件名
            const lastNav = Page.nav.collection[last]
            const lastTab = Page.tabs.collection[last]
            const lastTabIdx = Page.tabs.index[last]
            const curTab = Page.tabs.collection[tabname]
            const curNav = Page.nav.collection[tabname]
            const curTabIdx = Page.tabs.index[tabname]
            if (lastTabIdx < curTabIdx) {
                // 标签页向左走
            }
            else {
                // 标签页向右走
            }
            // 记录当前滑动的位置
            Page.tabs.scrolled[last] = Page.scrollTop
            // 更换标签页
            Page.tabs.list.appendChild(lastTab)
            Page.tabs.view.appendChild(curTab)
            Page.tabs.view.classList.remove('active')
            // 恢复上一次停留的位置
            Page.container.scrollTop = Page.tabs.scrolled[tabname]
            // 更新导航栏
            lastNav.classList.remove('active')
            curNav.classList.add('active')
            // 设置页面状态
            setTimeout(() => {
                Page.tabs.view.classList.add('active')
                document.title = `${tabname[0].toUpperCase()}${tabname.substring(1)} | ${Page.appName}`
                history.replaceState(0,0,tabname)
                // 渲染帖子
                if (!Page.tabs.isRendered[tabname]) {
                    Page.tabs.isRendered[tabname] = true
                    post_renderer(curTab)
                }
            },0)
        }
    },
    scrollTop: 0,
    scrollingUp: 0,
    scrollingDown: 0
}

window.onload = function() {
    const nav_items = []
    const tab_items = []
    for (const i of document.querySelector('nav').getElementsByTagName('li')) {
        nav_items.push(i)
    }
    for (const i of document.querySelectorAll('.tab')) {
        tab_items.push(i)
    }
    let k = 0
    for (const i of nav_items) {
        const tn = i.getAttribute('href')
        i.onclick = function() {
            Page.tabs.to(tn)
        }
        Page.nav.collection[tn] = i
        Page.tabs.collection[tn] = tab_items.shift()
        Page.tabs.index[tn] = k ++;
        Page.tabs.scrolled[tn] = 0
    }
    Page.tabs.list = document.querySelector('#tabs')
    Page.tabs.view = document.querySelector('#view')
    Page.container = document.querySelector('#container')
    const header = document.querySelector('header')
    Page.container.onscroll = function() {
        const ctnTop = Page.container.scrollTop
        if (ctnTop > Page.scrollTop) {
            if (!Page.scrollingDown) {
                Page.scrollingUp = 0
                Page.scrollingDown = ctnTop
            }
        }
        else {
            if (!Page.scrollingUp) {
                Page.scrollingUp = ctnTop
                Page.scrollingDown = 0
            }
        }
        if (Page.scrollingUp) {
            if (header.classList.contains('collapse')) {
                header.classList.remove('collapse')
            }
        }
        else {
            if (!header.classList.contains('collapse') && ctnTop - Page.scrollingDown > 100) {
                header.classList.add('collapse')
            }
        }
        Page.scrollTop = ctnTop
    }

    /* 建立 Vue */
    /* HOME */
    Vue.createApp({
        data() {
            return {
                items: [
                    {
                        id: '',
                        href: '/stusearch',
                        title: '学生资料查询',
                        des: 'an interesting database',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/drive/',
                        title: '云端硬盘',
                        des: 'an insecure cloud hard drive',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/games/balloons',
                        title: '戳泡泡游戏',
                        des: 'a game',
                        newtab: true
                    },
                    {
                        id: '',
                        href: '/games/starry-sky',
                        title: '星空',
                        des: 'ASMR',
                        newtab: true
                    },
                    {
                        id: '',
                        href: '/admin/logs',
                        title: 'LOGS',
                        des: 'admin only',
                        newtab: false
                    },
                    {
                        id: '',
                        href: '/admin/',
                        title: 'ADMIN',
                        des: 'admin only',
                        newtab: false
                    }
                ]
            }
        },
        methods: {
            random_rgb: random_rgb
        },
    }).mount('#home-links')
    
    /* TOOLS */
    Vue.createApp({
        data() {
            const tools = {
                'SCHE/S3S3': {
                    link: '/sche/s3s3',
                    newtab: false
                },
                'SCHE/S3S1': {
                    link: '/sche/s3s1',
                    newtab: false
                },
                '加密': {
                    link: '/tools/cryp',
                    newtab: false,
                    des: '拥有两种加密模式，中文密文和 64 进制密文。'
                },
                'MyIp': {
                    link: '/tools/ip',
                    newtab: true
                },
                '抽签签': {
                    link: '/tools/draw',
                    newtab: true
                },
                '座位表生成器': {
                    link: '/tools/seat',
                    newtab: true
                },
                '组织': {
                    link: '/ogns',
                    newtab: true,
                    des: '学校组织'
                },
                '2D Kingdom': {
                    link: '/games/2d-kingdom',
                    newtab: true,
                    des: 'a game'
                }
            }
            const x = []
            for (const i in tools) {
                tools[i].title = i
                x.push(tools[i])
            }
            return {
                items: x
            }
        }
    }).mount('ol#tools')

    setTimeout(() => {
        Page.tabs.to(location.pathname.split('/').pop() || 'home')
    },1)
}
const table64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function range(a,b,c) {
    // for i in range(10)
    // for i in range(2,10)
    // for i in range(2,10,2)
    if (b == undefined) {
        b = a
        a = 0
    }
    if (!c) {
        c = 1
    }
    const x = []
    for (let i = a; i < b; i += c) {
        x.push(i)
    }
    return x
}

function randomName(d=8) {
    const s = []
    for (const i of range(d)) {
        s.push(table64[Math.floor(Math.random() * table64.length)])
    }
    return s.join('')
}

function random_rgb(init,final) {
    return `rgb(${rand_rgb_unit(init,final)},${rand_rgb_unit(init,final)},${rand_rgb_unit(init,final)})`
}

function rand_rgb_unit(init,final) {
    return init + Math.random() * (final - init)
}
function post_renderer(ctn) {
    for (const i of ctn.querySelectorAll('.unrendered')) {
        text_render(i)
        i.classList.replace('unrendered','rendered')
    }
    for (const i of ctn.querySelectorAll('img')) {
        if (i.draggable) {
            i.draggable = false
        }
    }
}

function text_render(el) {
    const lines = el.innerText.split('\n')
    const y = []
    let x = []
    for (const i of lines) {
        for (const j of split_line(i)) {
            if (is_url(j)) {
                if (x.length) {
                    y.push(create_span(x.join('')))
                    x = []
                }
                y.push(create_a(j,j))
            }
            else {
                x.push(j)
            }
        }
        if (x.length) {
            y.push(create_span(x.join('')))
            x = []
        }
        y.push(create_br())
    }
    el.innerHTML = ''
    for (const i of y) {
        el.appendChild(i)
    }
    return y
}

function create_br() {
    return document.createElement('br')
}

function create_span(text,classList=[]) {
    const x =document.createElement('span')
    x.innerText = text
    for (const i of classList) {
        x.classList.add(i)
    }
    return x
}

function create_a(link,text,classList=[]) {
    const x =document.createElement('a')
    const reg = /(https?|ftp|file):\/{2}/g
    if (!(reg.test(link))) {
        link = `http:\/\/${link}`
    }
    x.href = link
    x.innerText = text
    x.rel = 'noopener noreferrer'
    x.target = '_blank'
    for (const i of classList) {
        x.classList.add(i)
    }
    return x
}

function is_url(url) {
    const reg = /((https?|ftp|file):\/\/)?([-A-Z0-9\.]{2,256}\.)?[-A-Z0-9]{2,256}\.[A-Z]{2,6}(\/[-A-Z0-9+&@#/%?=~_|!.,:;\u0250-\uffff]{1,})?\/?(?!\w|\S)/gi
    return reg.test(url)
}

function split_line(s) {
    const y = []
    let x = []
    for (const i of s) {
        if (/\s/.test(i)) {
            y.push(x.join(''))
            x = []
            y.push(i)
        }
        else {
            x.push(i)
        }
    }
    if (x.length) {
        y.push(x.join(''))
    }
    return y
}
